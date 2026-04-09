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

### add_to_favorite / remove_from_favorite

收藏/取消收藏活動。

| 參數       | 值            |
| ---------- | ------------- |
| event_page | `/event/[id]` |
| user_id    | 用戶 UID      |
| content_id | eventId       |

**實作位置：** `src/components/EventDetail/FavoriteButton.tsx`

---

### search_artist

開啟搜尋框，當使用者點擊搜尋按鈕開啟 modal 時觸發。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | -        |

**實作位置：** `src/components/search/ArtistSearchModal.tsx`

---

### click_artist

點擊藝人卡片，從搜尋結果跳轉到藝人地圖頁。

| 參數       | 值       |
| ---------- | -------- |
| event_page | `/`      |
| user_id    | 用戶 UID |
| content_id | artistId |

**實作位置：** `src/components/search/ArtistSearchModal.tsx`

---

### share_event

分享活動或藝人頁面（PWA 模式下）。

| 參數       | 值                                 |
| ---------- | ---------------------------------- |
| event_page | `/event/[id]` 或 `/map/[artistId]` |
| user_id    | 用戶 UID                           |
| content_id | eventId 或 artistId                |

**實作位置：** `src/components/ShareButton.tsx`

---

### click_map_marker

點擊地圖上的活動標記。

| 參數       | 值                |
| ---------- | ----------------- |
| event_page | `/map/[artistId]` |
| user_id    | 用戶 UID          |
| content_id | eventId           |

**實作位置：** `src/components/map/hook/useMapSelection.ts`

---

## 待實作的事件

### 中優先

| 事件            | 說明     | 觸發時機     |
| --------------- | -------- | ------------ |
| `login`         | 登入     | 登入成功     |
| `sign_up`       | 註冊     | 註冊成功     |
| `submit_event`  | 提交活動 | 表單送出成功 |
| `submit_artist` | 提交藝人 | 表單送出成功 |

### 低優先

| 事件                  | 說明         | 觸發時機               |
| --------------------- | ------------ | ---------------------- |
| `click_external_link` | 點擊外部連結 | 點擊 IG/X/Threads 連結 |
| `install_pwa`         | 安裝 PWA     | PWA 安裝成功           |

---

## User Properties

由 `GATracker` 自動設定：

| 屬性          | 值            | 說明         |
| ------------- | ------------- | ------------ |
| `environment` | `pwa` / `web` | 用戶使用環境 |

**實作位置：** `src/components/GATracker.tsx`
