# GA4 事件清單

> 新增、修改、移除事件時請更新此文件

## 已實作的事件

### page_view

頁面瀏覽事件，使用 `usePageView` hook 或 `PageViewTracker` 元件。

| 頁面     | event_page        | content_id | 狀態 |
| -------- | ----------------- | ---------- | ---- |
| 首頁     | `/`               | -          | ✅   |
| 活動詳情 | `/event/[id]`     | eventId    | ✅   |
| 藝人地圖 | `/map/[artistId]` | artistId   | ✅   |
| 我的收藏 | `/my-favorite`    | -          | ✅   |
| 設定     | `/settings`       | -          | ✅   |
| 提交活動 | `/submit-event`   | -          | ✅   |
| 提交藝人 | `/submit-artist`  | -          | ✅   |

**實作位置：**

- `src/hooks/usePageView.ts`
- `src/components/PageViewTracker.tsx`
- `src/components/map/MapPage.tsx`（藝人地圖頁直接呼叫 `usePageView`，2026-06-06 commit `42b238c` 的 map-new→map 改名曾移除，2026-09-28 補回）

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

---

## Event Detail

### add_to_favorite / remove_from_favorite

收藏/取消收藏活動。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：** `src/components/EventDetail/FavoriteButton.tsx`

### click_home

點擊「回首頁」按鈕。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：** `src/components/EventDetail/BackToHomeButton.tsx`

### click_instagram / click_threads / click_x

點擊外部社群連結。

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

---

## Map

### click_map_marker

點擊地圖上的活動標記。

| 參數       | 值                |
| ---------- | ----------------- |
| event_page | `/map/[artistId]` |
| user_id    | 用戶 UID          |
| content_id | eventId           |

**實作位置：** `src/components/map/hook/useMapSelection.ts`

---

### click_event_detail

點擊活動卡片進入活動詳情頁 `/event/[slug]`。地圖頁與場地詳情頁都有觸發，參數不同。

| 參數       | 值（地圖頁）                   | 值（場地詳情頁） |
| ---------- | ------------------------------ | ---------------- |
| event_page | `/map/[artistId]`              | `/venues/[id]`   |
| user_id    | 用戶 UID                       | 用戶 UID         |
| content_id | eventId                        | eventId          |
| artist_id  | artistId                       | -                |
| source     | `map_single_card` / `carousel` | -                |

**實作位置：**

- `src/components/map/MapSingleEventCard.tsx`（`source: map_single_card`）
- `src/components/map/EventCarouselCard.tsx`（`source: carousel`）
- `src/lib/analytics/venues.ts`（`trackClickEventDetail`）、`src/components/venues/PastEventsStrip.tsx`（場地詳情頁過往活動卡片，2026-09-28 新增）

---

## Venues

### view_venue_card / click_venue_detail

場地卡片在 `/venues` 列表頁進入視窗（曝光）或被點擊進入詳情頁。`list_sort`（Phase 2.8 新增，2026-09-28）記錄卡片曝光/點擊當下 `/venues` 生效的排序值，讓 GA4 能依排序分組算 CTR。首頁隨機場地卡片（`placement: homepage_random`）固定 `sort=random`，沒有排序語意，不帶這個參數。

| 參數          | 值（列表頁）                            | 值（首頁隨機卡片） |
| ------------- | --------------------------------------- | ------------------ |
| event_page    | `/venues`                               | `/`                |
| placement     | -                                       | `homepage_random`  |
| user_id       | 用戶 UID（未登入傳空字串）              | -（首頁版本不帶）  |
| content_id    | `venue_{venueId}`                       | `venue_{venueId}`  |
| venue_region  | venueRegion                             | venueRegion        |
| list_position | listPosition                            | listPosition       |
| list_sort     | `composite` \| `newest` \| `eventCount` | -（不帶）          |

**實作位置：**

- `src/lib/analytics/venues.ts`（`trackViewVenueCard`、`trackClickVenueDetail`、`trackViewHomeVenueCard`、`trackClickHomeVenueDetail`）
- `src/components/venues/VenueCard.tsx`（列表頁，`listSort` 來自 `VenuesClient` 目前生效的 `sort` state）
- `src/components/HomePage/components/HomeVenueCard.tsx`（首頁隨機卡片，不傳 `listSort`）

### sort_venues

使用者在 `/venues` 排序 dropdown 選取一個新選項時觸發（Phase 2.8 新增，2026-09-28）。只在**實際切換**到不同排序值時送出，選到跟目前相同的值不送。`sort_from`/`sort_to` 一律是 `'composite' | 'newest' | 'eventCount'` 三個字面值之一，未帶 `sort` URL 參數（預設排序）記為 `composite`，不會是空字串或 undefined。

| 參數            | 值                                          |
| --------------- | ------------------------------------------- |
| event_page      | `/venues`                                   |
| user_id         | 用戶 UID（未登入傳空字串）                  |
| content_id      | `''`（比照 `filter_venues` 的既有寫法）     |
| sort_from       | 切換前生效的排序值                          |
| sort_to         | 切換後的排序值                              |
| filter_region   | 切換當下的地區篩選值                        |
| filter_capacity | 切換當下的容納人數篩選值                    |
| search_query    | 切換當下的搜尋關鍵字                        |
| result_count    | 切換當下（filter 後、換 sort 前）的結果筆數 |

**實作位置：**

- `src/lib/analytics/venues.ts`（`trackSortVenues`）
- `src/app/venues/(list)/VenuesClient.tsx`（`handleSortChange`）

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

### install_pwa

PWA 安裝成功時觸發。

| 參數       | 值           |
| ---------- | ------------ |
| event_page | 當前頁面路徑 |
| user_id    | 用戶 UID     |
| content_id | -            |

**實作位置：** `src/components/pwa/PWAInstallPrompt.tsx`

---

## User Properties

由 `GATracker` 自動設定：

| 屬性          | 值            | 說明         |
| ------------- | ------------- | ------------ |
| `environment` | `pwa` / `web` | 用戶使用環境 |

**實作位置：** `src/components/GATracker.tsx`
