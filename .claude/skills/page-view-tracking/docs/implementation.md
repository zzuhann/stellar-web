# Page View Tracking - 前端實作清單

> 新增、修改實作時請更新此文件

---

## Type 定義

### `TrendingEventsResponse`（`src/types/index.ts`）

```ts
interface TrendingEventsResponse {
  events: CoffeeEvent[];
  total: number;
}
```

> `CoffeeEvent` 需同步加上 `viewCount?: number`

---

## API Functions

| Function                    | 對應 Endpoint           | 實作位置         | 狀態 |
| --------------------------- | ----------------------- | ---------------- | ---- |
| `recordEventView(eventId)`  | `POST /events/:id/view` | `src/lib/api.ts` | TODO |
| `getTrendingEvents(limit?)` | `GET /events/trending`  | `src/lib/api.ts` | TODO |

---

## 瀏覽量記錄觸發

| 觸發位置                | 時機            | 方式                                   | 狀態 |
| ----------------------- | --------------- | -------------------------------------- | ---- |
| `EventDetail/index.tsx` | component mount | fire-and-forget + sessionStorage dedup | TODO |

### 實作範例

```ts
useEffect(() => {
  const key = `viewed_event_${eventId}`;
  if (sessionStorage.getItem(key)) return;

  recordEventView(eventId).catch(() => {});
  sessionStorage.setItem(key, '1');
}, [eventId]);
```

---

## 排行榜 UI

| 元件                           | 位置 | 狀態 |
| ------------------------------ | ---- | ---- |
| TrendingTab 或 TrendingSection | 待定 | TODO |

---

## CoffeeEvent Type 異動

前端 `src/types/index.ts` 的 `CoffeeEvent` 需加上：

```ts
viewCount?: number
```

| 檔案                 | 狀態 |
| -------------------- | ---- |
| `src/types/index.ts` | TODO |
