---
name: page-view-tracking
description: 活動瀏覽量追蹤 - 前端實作規格
---

# 活動瀏覽量追蹤 - 前端

> **重要**：新增、修改實作時，請同步更新 [docs/implementation.md](./docs/implementation.md)

## 設計原則

- **Fire-and-forget**：送出 view request 不 await，失敗不影響頁面體驗
- **sessionStorage dedup**：同一個 tab session 內，同一個活動只發一次 request
- **排行榜資料與活動詳情分開**：各自有獨立的 API function

---

## Dedup 策略（前端）

```ts
const key = `viewed_event_${eventId}`;
if (sessionStorage.getItem(key)) return;

recordEventView(eventId).catch(() => {});
sessionStorage.setItem(key, '1');
```

使用 `sessionStorage`（非 `localStorage`）：

- 關閉 tab 後重置，合理模擬「重新到訪」
- 無法跨 tab 共用，保守設計

> 前端 dedup 只是減少無意義請求，後端仍有 IP-based dedup 作為第二層防護。

---

## API Functions（`src/lib/api.ts` 或獨立 `eventViewApi.ts`）

### `recordEventView(eventId: string): Promise<void>`

```ts
// POST /api/events/:id/view
// 回傳 void，前端不處理回傳值
```

### `getTrendingEvents(limit?: number): Promise<TrendingEventsResponse>`

```ts
// GET /api/events/trending?limit={limit}
```

---

## 實作位置

### 瀏覽量記錄

- **觸發位置**：`src/components/EventDetail/index.tsx`（或對應的 hook）
- **時機**：component mount 時（`useEffect` 第一次執行）
- **方式**：fire-and-forget + sessionStorage dedup

### 排行榜

- **UI 位置**：待定（首頁新增 tab 或獨立 section）
- **資料抓取**：`useQuery` 或 `useSWR`，key 為 `['trending-events', limit]`

---

## 注意事項

1. **不要 await recordEventView**：避免影響頁面載入速度
2. **排行榜顯示 viewCount**：可選擇性顯示，設計上不一定要暴露數字給使用者
3. **Server Component 限制**：view 記錄必須在 Client Component 中執行（需要 `useEffect`）

---

## 相關檔案

- `docs/implementation.md` - 實作狀態與位置清單
- `src/lib/api.ts` - API function（新增 recordEventView, getTrendingEvents）
- `src/components/EventDetail/index.tsx` - 觸發 view 記錄
- `src/app/event/[eventId]/page.tsx` - 活動詳情頁（Server Component）
