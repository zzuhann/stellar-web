# STELLAR 事件規劃參考

規劃新功能的 Tracking Plan 時，參考這裡找適合的事件類型。
已實作的完整事件清單在 `docs/events.md`。

---

## 頁面瀏覽

不需要手動規劃，統一用 `usePageView` hook 或 `PageViewTracker` 元件。
詳見 `page-view-tracking` skill。

---

## 內容互動類

使用者對活動、藝人、場地等內容的操作。

| 情境         | 建議事件名稱           | content_id |
| ------------ | ---------------------- | ---------- |
| 收藏活動     | `add_to_favorite`      | eventId    |
| 取消收藏活動 | `remove_from_favorite` | eventId    |
| 收藏藝人     | `add_to_favorite`      | artistId   |
| 點擊地圖標記 | `click_map_marker`     | eventId    |
| 查看活動詳情 | `view_event_detail`    | eventId    |
| 查看藝人頁面 | `view_artist_detail`   | artistId   |
| 查看場地頁面 | `view_venue_detail`    | venueId    |

---

## 搜尋 / 篩選類

使用者主動尋找內容的行為。

| 情境     | 建議事件名稱    | content_id     |
| -------- | --------------- | -------------- |
| 搜尋藝人 | `search_artist` | 搜尋詞（字串） |
| 篩選活動 | `filter_events` | 篩選條件       |

---

## 分享類

使用者傳播內容的行為。

| 情境     | 建議事件名稱   | content_id |
| -------- | -------------- | ---------- |
| 分享活動 | `share_event`  | eventId    |
| 分享藝人 | `share_artist` | artistId   |

---

## 導航類

頁面內的跳轉行為（有助於了解用戶流向）。

| 情境             | 建議事件名稱         | content_id  |
| ---------------- | -------------------- | ----------- |
| 點擊回首頁 CTA   | `click_home`         | —（空字串） |
| 點擊活動詳情連結 | `click_event_detail` | eventId     |

---

## 表單送出類

使用者提交資料的行為。

| 情境         | 建議事件名稱    | content_id       |
| ------------ | --------------- | ---------------- |
| 提交活動申請 | `submit_event`  | eventId（若有）  |
| 提交藝人申請 | `submit_artist` | artistId（若有） |

---

## 用戶行為類

帳號相關行為，通常一個功能只在特定流程出現。

| 情境 | 建議事件名稱 | content_id  |
| ---- | ------------ | ----------- |
| 登入 | `login`      | —（空字串） |
| 註冊 | `sign_up`    | —（空字串） |

---

## 規劃原則

- **優先重用既有事件名稱**，不要為相似行為創造新的事件名
- **content_id 不確定時**，先在 Tracking Plan 標注「TBD」，實作前確認
- **一個行為只追蹤一次**，避免 duplicate events
- **命名疑問**：對照 `ga4-tracking` skill 的事件命名規範
