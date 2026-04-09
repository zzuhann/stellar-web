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

---

## Home

### search_artist

開啟搜尋框，當使用者點擊搜尋按鈕開啟 modal 時觸發。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/search/ArtistSearchModal.tsx`

### click_artist

點擊藝人卡片，從搜尋結果跳轉到藝人地圖頁。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | artistId |

**實作位置：** `src/components/search/ArtistSearchModal.tsx`

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

## Map & Event Detail

### share_event

分享活動或藝人頁面（PWA 模式下）。

| 參數       | 值                                 |
| ---------- | ---------------------------------- |
| event_page | `/event/[id]` 或 `/map/[artistId]` |
| user_id    | 用戶 UID                           |
| content_id | eventId 或 artistId                |

**實作位置：** `src/components/ShareButton.tsx`

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
