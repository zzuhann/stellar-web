# Event Slug 實作（已上線）

## Slug 格式

```
{artist-slug(s)}-{YYYY}-{MM}-{firestoreId 前六碼}
```

| 藝人數量 | 範例                                                 |
| -------- | ---------------------------------------------------- |
| 1 個     | `bts-2025-04-xK2mNp`                                 |
| 2 個     | `bts-txt-2025-04-xK2mNp`                             |
| 3 個以上 | `bts-txt-collab-2025-04-xK2mNp`（前兩個 + `collab`） |

- `YYYY-MM` 取自 `datetime.start`
- 若藝人無 slug，fallback 用藝人 id 前六碼
- 後端自動生成，不開放使用者自訂

---

## 前端實作

### 1. 型別定義

`src/types/index.ts` — `CoffeeEvent` 新增 `slug` 欄位：

```typescript
export interface CoffeeEvent {
  slug?: string;
  // ...
}
```

### 2. Redirect 邏輯

`src/app/event/[eventId]/page.tsx`（鏡像 artist slug 作法）：

```typescript
import { notFound, permanentRedirect } from 'next/navigation';

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;

  if (!eventId || eventId.trim() === '') {
    notFound();
  }

  const event = await eventsApi.getById(eventId).catch(() => null);

  if (event?.slug && eventId !== event.slug) {
    permanentRedirect(`/event/${event.slug}`);
  }

  return <EventDetail event={event} />;
}
```

### 3. 內部連結

所有導向活動頁的 `Link` 和 `router.push` 都改用 `event.slug ?? event.id`，避免 redirect round-trip：

```typescript
// EventCard/index.tsx, EventCard/VerticalEventCard.tsx, EventCardCarousel/VerticalEventCard.tsx
<Link href={`/event/${event.slug ?? event.id}`}>
router.push(`/event/${event.slug ?? event.id}`)
```

`?? event.id` fallback 保持向後兼容，backfill 未完成的舊活動不會壞掉。

### 4. Sitemap

`src/app/sitemap.ts`：

```typescript
const eventRoutes = events.map((event) => ({
  url: `${BASE_URL}/event/${event.slug ?? event.id}`,
  lastModified: tsToDate(event.updatedAt),
  changeFrequency: 'weekly',
  priority: 0.7,
}));
```

---

## 後端合約

- `GET /events/:id`：接受 Firestore 完整 ID 或 slug，response 含 `slug` 欄位
- `GET /events`（列表）：每筆 event 含 `slug` 欄位（sitemap、內部連結需要）
- 新建活動（`POST /events`）：建立後立即寫入 slug
- Migration：既有活動需要 backfill script 補上 slug
