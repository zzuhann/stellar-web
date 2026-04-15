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

**位置**：`HomePage/index.tsx` 的「即將到來的生日應援」carousel 下方，WeekNavigation 上方

**UI 參考**：直接複用 `EventCardCarousel`（Swiper carousel）

**viewCount 顯示**：不顯示數字，僅用於後端排序

| 元件                    | 位置                                                           | 狀態 |
| ----------------------- | -------------------------------------------------------------- | ---- |
| `TrendingEventsSection` | `src/components/HomePage/components/TrendingEventsSection.tsx` | TODO |

### 首頁結構（修改後）

```
HomePage
├── CTA Button
├── ✩ 即將到來的生日應援（EventCardCarousel）  ← 既有
├── ✩ 熱門活動排行（TrendingEventsSection）    ← 新增
└── 每週壽星與生日應援（WeekNavigation + tabs）← 既有
```

### TrendingEventsSection 規格

- 標題：`✩ 熱門活動排行`（與既有 heading 樣式一致）
- 資料：`getTrendingEvents(10)`
- 呈現：直接複用 `EventCardCarousel` 元件
- Empty / loading：由 `EventCardCarousel` 內部處理（events 為空時 return null）

---

## CoffeeEvent Type 異動

前端 `src/types/index.ts` 的 `CoffeeEvent` 需加上：

```ts
viewCount?: number
```

| 檔案                 | 狀態 |
| -------------------- | ---- |
| `src/types/index.ts` | TODO |
