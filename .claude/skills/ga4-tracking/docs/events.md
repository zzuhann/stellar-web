# GA4 事件清單

> 新增、修改、移除事件時請更新此文件

## 判讀陷阱（查數據前必讀）

2026-10-13 健檢整理，詳見 monorepo `specs/_ops/ga4-tracking-audit-2026-10-13.md`。

1. **`page_view` 自 2026-10-14 起單一來源、不重疊**：硬載入由 gtag 原生自動送；站內換頁由 `SoftNavigationPageView`（layout 全站一處）送，只在 pathname 改變時送，query string 變更（篩選、翻頁、切 tab）不送。舊的每頁自訂版 `usePageView`／`PageViewTracker`（帶 `event_page`/`content_id`）已移除。
   - **GA 後台「加強型評估 → 網頁瀏覽 → 根據瀏覽器記錄事件變更網頁」必須關閉**：開啟會讓每次網址參數更新都算一次瀏覽（`/venues` 換篩選、首頁切 tab／換週都會灌水），也會跟 `SoftNavigationPageView` 重複。
   - **之後**：分頁面用 `pagePath`（例：開頭 `/map/`），不再有 `event_page`/`content_id`/`user_id`。網址裡是 slug 不是 id（活動頁 `/event/{slug 或 id}`、地圖頁 `/map/{artist slug 或 id}`），跟 Firestore id 交叉比對（例：event-reservation 曝光數）要先用 slug 對回 id；場地頁 `/venues/{id}` 是 id，跟其他場地事件的 `content_id` 串接時要補 `venue_` 前綴。
   - **之前**：原生（硬載入）與自訂版同名並存，GA 內建「瀏覽量」重複計算。看 2026-10-14 以前的單頁瀏覽量要篩 `event_page != (not set)`。
   - **跨日比較**：上線當天起 GA 內建瀏覽量會下降（重複計算消失），不是流量下滑。各 `specs/features/*/tracking.md` 寫「`page_view`(event_page=X)」的公式，之後一律改讀成「`page_view`(pagePath 對應 X)」。
   - **標題與來源**：站內換頁延後一格畫面才送，`page_title` 讀新頁標題、`page_referrer` 帶站內前一頁網址。標題若仍有誤以 `pagePath` 為準。用戶端重新導向（例：錯誤的地圖網址被導回首頁）會算一次導向後頁面的瀏覽。
2. **`click_event_detail` 混了兩個頁面**：地圖頁（帶 `artist_id`、`ui_source`）與場地詳情頁（`/venues/[id]`，不帶 `artist_id`）。算轉換率先用 `event_page` 拆開。
3. **`search_artist` 是打開搜尋 modal 就送**，使用者還沒輸入。讀成「開啟搜尋」，不是「搜尋過」。
4. **`view_venue_card` 是曝光事件**，次數跟著列表長度走。比較場地或排序時用比例（點擊 ÷ 曝光），不要比次數。
5. **自訂維度不回溯**：維度在後台註冊之前的資料都是 `(not set)`。看有值率前先確認期間是否晚於註冊日；長期間的空值多半是這個原因，不是 bug。
6. **`source` 維度已廢棄**：舊參數 `source` 會覆蓋 GA 的流量來源歸因，2026-10 改名 `ui_source`。2026-10 以前的工作階段來源裡出現 `carousel`／`map_single_card`／`menu_select` 是被污染的（90 天約 1,000 個 session），不是真的流量來源。
7. **2026-10-13 起的定義變更**：`add_to_favorite` 只在 API 成功才計（數字會比以前略低）；`map_bottom_sheet_expand` 不再計入半開狀態下的小幅拖拉；`switch_to_*_tab` 重點同 tab 不計；`/venues` 的 `list_position` 改為跨頁絕對位置、`result_count` 改為總筆數。跨這個日期比較時要注意。

## 已實作的事件

### page_view

單一來源、不重疊（2026-10-14 起）：

| 情境                                    | 誰送                     | 參數                                                     |
| --------------------------------------- | ------------------------ | -------------------------------------------------------- |
| 硬載入（外部連結進站、重新整理）        | gtag 原生自動            | `page_location`／`page_path`／`page_title`               |
| 站內換頁（pathname 改變）               | `SoftNavigationPageView` | `page_location`／`page_title`／`page_referrer`（前一頁） |
| 只改 query string（篩選、翻頁、切 tab） | 不送                     | —                                                        |

前提：GA 後台「資料串流 → 加強型評估 → 網頁瀏覽 → 進階設定 → 根據瀏覽器記錄事件變更網頁」**必須關閉**。

**實作位置：** `src/components/SoftNavigationPageView.tsx`（掛在 `src/app/layout.tsx`）。舊的自訂版 `usePageView`／`PageViewTracker` 已移除，見「判讀陷阱」第 1 點。

---

## Header Navigation

### nav_submit_event

點擊 Header 中「舉辦生日應援」連結。

| 參數       | 值                             |
| ---------- | ------------------------------ |
| event_page | 當前頁面路徑                   |
| user_id    | 用戶 UID（未登入傳空字串）     |
| content_id | `mobile_menu` 或 `desktop_nav` |

**實作位置：**

- `src/components/header/MobileMenu.tsx`
- `src/components/header/DesktopNav.tsx`

### nav_submit_artist

點擊 Header 中「新增藝人」連結。

| 參數       | 值                             |
| ---------- | ------------------------------ |
| event_page | 當前頁面路徑                   |
| user_id    | 用戶 UID（未登入傳空字串）     |
| content_id | `mobile_menu` 或 `desktop_nav` |

**實作位置：**

- `src/components/header/MobileMenu.tsx`
- `src/components/header/DesktopNav.tsx`

---

### nav_venues

點擊導覽列的「場地」連結。

| 參數       | 值                                      |
| ---------- | --------------------------------------- |
| event_page | 觸發當下實際頁面路徑（`usePathname()`） |
| user_id    | 用戶 UID                                |
| content_id | `desktop_nav` / `mobile_menu`           |

**實作位置：** `src/components/header/DesktopNav.tsx`、`src/components/header/MobileMenu.tsx`

---

## Home

### switch_to_artist_tab

切換到「壽星」tab。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/HomePage/hook/useTabState.ts`

### switch_to_event_tab

切換到「生日應援」tab。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/HomePage/hook/useTabState.ts`

### navigate_previous_week

點擊上一週按鈕。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/HomePage/components/WeekNavigation.tsx`

### navigate_next_week

點擊下一週按鈕。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/HomePage/components/WeekNavigation.tsx`

### click_trending_event

點擊熱門生咖活動卡片。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | eventId  |

**實作位置：** `src/components/HomePage/components/TrendingEventsSection.tsx`

### click_top_artist

點擊「擁有最多生咖」區塊的藝人卡片。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | artistId |

**實作位置：** `src/components/HomePage/components/TopArtistsSection.tsx`

### click_add_event_button

點擊「新增生咖」按鈕（在擁有最多生咖區塊）。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/HomePage/components/TopArtistCarousel/index.tsx`

### search_artist

開啟搜尋框，當使用者點擊搜尋按鈕開啟 modal 時觸發。

| 參數        | 值                                          |
| ----------- | ------------------------------------------- |
| event_page  | 觸發當下實際頁面路徑（`usePathname()`）     |
| user_id     | 用戶 UID                                    |
| content_id  | -                                           |
| entry_point | `header` / `top_artists` / `search_section` |

**實作位置：** `src/components/search/ArtistSearchModal.tsx`（開啟 modal 的 `useEffect`）。`entry_point` 由呼叫端（`HeaderSearchButton` / `TopArtistsSection` / `SearchSection`）經 `useSearchModalStore` 傳入，同一次 modal session 內與 `click_artist` 的值一致。

### click_artist

點擊藝人卡片，從搜尋結果跳轉到藝人地圖頁。

| 參數        | 值                                                   |
| ----------- | ---------------------------------------------------- |
| event_page  | 觸發當下實際頁面路徑（`usePathname()`）              |
| user_id     | 用戶 UID                                             |
| content_id  | artistId                                             |
| entry_point | 與同一次 modal session 開啟時相同的 `entry_point` 值 |

**實作位置：** `src/components/search/ArtistSearchModal.tsx`（`ArtistCardLink` 的 `onBeforeNavigate`）

### click_event_card / click_artist_card

點擊首頁週曆裡的活動卡片（生咖 tab）或壽星卡片（壽星 tab）。

| 參數       | 值                                         |
| ---------- | ------------------------------------------ |
| event_page | `/`                                        |
| user_id    | 用戶 UID                                   |
| content_id | eventId（活動卡片）／ artistId（壽星卡片） |

**實作位置：** `src/components/HomePage/components/WeekEventCard.tsx`、`WeekArtistCard.tsx`

---

## Event Detail

### add_to_favorite / remove_from_favorite

收藏/取消收藏活動。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

只在收藏 API 成功後送出（失敗不計）。未登入點收藏 → 登入後自動收藏的路徑也會送（2026-10-13 補上），`user_id` 取 Firebase 目前登入者。

**實作位置：** `src/hooks/useFavoriteToggle.ts`（mutation `onSuccess`，所有收藏按鈕共用）

### click_favorite_logged_out

未登入使用者點擊收藏按鈕（隨後照舊開登入 modal/sheet）。用來和 `add_to_favorite` 對照，分出「卡在登入牆」與「沒人點」。auth 載入中 `user` 為 null，視同未登入，也會送出。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| content_id | eventId       |

不帶 `user_id`（未登入無值）。

**實作位置：** `src/components/EventDetail/EventBottomBar.tsx`、`DesktopFavoriteButton.tsx`

### click_instagram / click_threads

點擊外部社群連結。（`ExternalLink` 型別保留 `x`，但目前沒有呼叫端送 `click_x`）

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：**

- `src/components/ui/ExternalLink.tsx`
- `src/components/EventDetail/index.tsx`

### click_location

點擊活動地點連結（開啟 Google Maps）。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：**

- `src/components/ui/ExternalLink.tsx`
- `src/components/EventDetail/index.tsx`

### click_calendar

點擊「加入行事曆」連結（開啟 Google Calendar）。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：**

- `src/components/ui/ExternalLink.tsx`
- `src/components/EventDetail/index.tsx`

### click_reservation / click_reservation_calendar

點擊活動的預約連結，或預約提醒列的「加入行事曆」。事件名由 `ExternalLink` 的 `platform` 組成（`click_${platform}`）。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：** `src/components/ui/ExternalLink.tsx`；`src/components/EventDetail/index.tsx`（`reservation`）、`ReservationReminderRow.tsx`（`reservation_calendar`）

### click_related_event

點擊活動詳情頁下方的相關活動卡片。

| 參數       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| event_page | `/event/[id]`                                        |
| user_id    | 用戶 UID                                             |
| content_id | **被點擊的相關活動** eventId（目的地，不是目前頁面） |

**實作位置：** `src/components/EventDetail/RelatedEventCard.tsx`（唯一呼叫端 `MoreEventsCarousel.tsx`）

---

## Map

### click_map_marker

點擊地圖上的活動標記。

| 參數       | 值                |
| ---------- | ----------------- |
| event_page | `/map/[artistId]` |
| user_id    | 用戶 UID          |
| content_id | eventId           |

**實作位置：** `src/components/map/MapPage.tsx`

---

### click_event_detail

點擊活動卡片進入活動詳情頁 `/event/[slug]`。地圖頁與場地詳情頁都有觸發，參數不同。

| 參數       | 值（地圖頁）                   | 值（場地詳情頁） |
| ---------- | ------------------------------ | ---------------- |
| event_page | `/map/[artistId]`              | `/venues/[id]`   |
| user_id    | 用戶 UID                       | 用戶 UID         |
| content_id | eventId                        | eventId          |
| artist_id  | artistId                       | -                |
| ui_source  | `map_single_card` / `carousel` | -                |

注意：參數名不可用 `source`，GA4 會把它當流量來源覆蓋 session 歸因（2026-10 起改名為 `ui_source`，與 `resolve_venue_geolocation` 共用同一個自訂維度）。

**實作位置：**

- `src/components/map/MapSingleEventCard.tsx`（`ui_source: map_single_card`）
- `src/components/map/EventCarouselCard.tsx`（`ui_source: carousel`）
- `src/lib/analytics/venues.ts`（`trackClickEventDetail`）、`src/components/venues/PastEventsStrip.tsx`（場地詳情頁過往活動卡片，2026-09-28 新增）

### map_bottom_sheet_expand

地圖頁底部清單從收合展開到半開。

| 參數           | 值                                        |
| -------------- | ----------------------------------------- |
| event_page     | `/map/[artistId]`                         |
| user_id        | 用戶 UID                                  |
| content_id     | artistId                                  |
| trigger_method | `drag` / `tap_handle` / `location_filter` |

`drag` 只在拖曳起點位於 snap 中線以下時計（2026-10-13 修正：半開狀態小幅拖拉不再誤計）。`location_filter` 是點地圖上多活動地點時自動展開，不是使用者拖拉。

**實作位置：** `src/components/map/MapBottomSheet.tsx`、判斷邏輯在 `src/components/map/hooks/useBottomSheet.ts`

### map_location_filter_apply

點地圖上同一地點有多個活動的標記，清單篩成該地點。

| 參數          | 值                 |
| ------------- | ------------------ |
| event_page    | `/map/[artistId]`  |
| user_id       | 用戶 UID           |
| content_id    | artistId           |
| location_name | 地點名稱（或城市） |

**實作位置：** `src/components/map/MapPage.tsx`（`handleMultiMarkerClick`）

---

## Venues

### view_venue_card / click_venue_detail

場地卡片在 `/venues` 列表頁進入視窗（曝光）或被點擊進入詳情頁。`list_sort`（Phase 2.8 新增，2026-09-28）記錄卡片曝光/點擊當下 `/venues` 生效的排序值，讓 GA4 能依排序分組算 CTR。首頁隨機場地卡片（`placement: homepage_random`）固定 `sort=random`，沒有排序語意，不帶這個參數。

| 參數          | 值（列表頁）                                          | 值（首頁隨機卡片） |
| ------------- | ----------------------------------------------------- | ------------------ |
| event_page    | `/venues`                                             | `/`                |
| placement     | -                                                     | `homepage_random`  |
| user_id       | 用戶 UID（未登入傳空字串）                            | -（首頁版本不帶）  |
| content_id    | `venue_{venueId}`                                     | `venue_{venueId}`  |
| venue_region  | venueRegion                                           | venueRegion        |
| list_position | 跨頁絕對位置（第 2 頁第 1 張 = 21）                   | listPosition       |
| list_sort     | `composite` \| `newest` \| `eventCount` \| `distance` | -（不帶）          |

**實作位置：**

- `src/lib/analytics/venues.ts`（`trackViewVenueCard`、`trackClickVenueDetail`、`trackViewHomeVenueCard`、`trackClickHomeVenueDetail`）
- `src/components/venues/VenueCard.tsx`（列表頁，`listSort` 來自 `VenuesClient` 目前生效的 `sort` state）
- `src/components/HomePage/components/HomeVenueCard.tsx`（首頁隨機卡片，不傳 `listSort`）

### sort_venues

使用者在 `/venues` 排序 dropdown 選取一個新選項時觸發（Phase 2.8 新增，2026-09-28）。只在**實際切換**到不同排序值時送出，選到跟目前相同的值不送。`sort_from`/`sort_to` 一律是 `'composite' | 'newest' | 'eventCount' | 'distance'` 四個字面值之一（`distance` 由 venue-distance-sort 加入），未帶 `sort` URL 參數（預設排序）記為 `composite`，不會是空字串或 undefined。

| 參數            | 值                                                                      |
| --------------- | ----------------------------------------------------------------------- |
| event_page      | `/venues`                                                               |
| user_id         | 用戶 UID（未登入傳空字串）                                              |
| content_id      | `''`（比照 `filter_venues` 的既有寫法）                                 |
| sort_from       | 切換前生效的排序值                                                      |
| sort_to         | 切換後的排序值                                                          |
| filter_region   | 切換當下的地區篩選值                                                    |
| filter_capacity | 切換當下的容納人數篩選值                                                |
| search_query    | 切換當下的搜尋關鍵字                                                    |
| result_count    | 切換當下（filter 後、換 sort 前）的結果總筆數（跨頁 total，非當頁筆數） |

**實作位置：**

- `src/lib/analytics/venues.ts`（`trackSortVenues`）
- `src/app/venues/(list)/VenuesClient.tsx`（`handleSortChange`）

### click_venue_list_cta

首頁隨機場地區塊的「看全部場地」CTA。

| 參數       | 值                |
| ---------- | ----------------- |
| event_page | `/`               |
| placement  | `homepage_random` |

**實作位置：** `src/lib/analytics/venues.ts`（`trackClickVenueListCta`）

### filter_venues

`/venues` 套用地區、容納人數篩選或搜尋，結果載入後送一次。

| 參數            | 值                                          |
| --------------- | ------------------------------------------- |
| event_page      | `/venues`                                   |
| user_id         | 用戶 UID（未登入傳空字串）                  |
| content_id      | `''`                                        |
| filter_region   | 地區（`全部` 或縣市）                       |
| filter_capacity | 容納人數（`all` 或區間）                    |
| search_query    | 搜尋關鍵字                                  |
| result_count    | 篩選後總筆數（跨頁 total，2026-10-13 修正） |

**實作位置：** `src/lib/analytics/venues.ts`（`trackFilterVenues`）、`src/app/venues/(list)/VenuesClient.tsx`

### resolve_venue_geolocation

距離排序要求定位權限的結果。隱私硬規則：不帶座標、距離或 accuracy。

| 參數            | 值                                               |
| --------------- | ------------------------------------------------ |
| event_page      | `/venues`                                        |
| user_id         | 用戶 UID（未登入傳空字串）                       |
| content_id      | `''`                                             |
| location_result | `granted` / `denied` / `unsupported` / `timeout` |
| ui_source       | `menu_select` / `share_link`                     |

**實作位置：** `src/lib/analytics/venues.ts`（`trackResolveVenueGeolocation`）

### click_venue_contact

場地詳情頁點聯絡方式（外導 IG／Threads／LINE 私訊）。站上沒有媒合功能，這是主辦的預約意圖，場地功能的主要轉換。

| 參數         | 值                                  |
| ------------ | ----------------------------------- |
| event_page   | `/venues/[id]`                      |
| user_id      | 用戶 UID（未登入傳空字串）          |
| content_id   | `venue_{venueId}`                   |
| contact_type | `instagram` / `threads` / `line` 等 |

**實作位置：** `src/lib/analytics/venues.ts`（`trackClickVenueContact`）、`src/components/venues/VenueDetailView.tsx`

---

## Map & Event Detail

### share_event

分享活動或藝人頁面（PWA 模式下）。

| 參數            | 值                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| event_page      | `/event/[id]` 或 `/map/[artistId]`                                                                                  |
| user_id         | 用戶 UID                                                                                                            |
| content_id      | eventId 或 artistId                                                                                                 |
| button_location | `bottom_bar` / `bottom_sheet`（活動頁）、`map_bottom_sheet`（地圖頁）；`top_button` 已停用（header 分享按鈕已移除） |

**實作位置：** `src/components/EventDetail/EventBottomBar.tsx`（活動頁）、`src/components/map/MapBottomSheet.tsx`（地圖頁）

---

### login

登入成功時觸發（Google 登入或訪客登入）。

| 參數       | 值                      |
| ---------- | ----------------------- |
| event_page | `/`                     |
| user_id    | 用戶 UID                |
| content_id | `google` 或 `anonymous` |

**實作位置：**

- `src/components/auth/GoogleLoginButton.tsx`
- `src/components/auth/AnonymousLoginButton.tsx`

---

### submit_event

投稿活動成功時觸發。

| 參數       | 值              |
| ---------- | --------------- |
| event_page | `/submit-event` |
| user_id    | 用戶 UID        |
| content_id | eventId         |

**實作位置：** `src/components/submitEvent/hooks/useCreateEventMutation.ts`

---

### submit_artist

投稿藝人表單成功時觸發。

| 參數       | 值               |
| ---------- | ---------------- |
| event_page | `/submit-artist` |
| user_id    | 用戶 UID         |
| content_id | -                |

**實作位置：** `src/components/forms/ArtistSubmissionForm.tsx`

---

## User Properties

| 屬性          | 值            | 說明         |
| ------------- | ------------- | ------------ |
| `environment` | `pwa` / `web` | 用戶使用環境 |

**目前沒有發送端**：原本設定它的 `GATracker.tsx` 已移除，後台維度保留中（2026-10-13 使用者決定留著），28 天內只有 76 位使用者有值。要讀 PWA 使用者比例前，需先補回設定程式。
