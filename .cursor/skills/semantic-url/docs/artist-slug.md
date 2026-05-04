# Artist Slug 實作（已上線）

## 型別定義

`src/types/index.ts`

```typescript
export interface Artist {
  slug?: string; // 人類可讀的 URL slug（例：bts, blackpink）
  // ...
}
```

## Redirect 邏輯

`src/app/map/[artistId]/page.tsx`

```typescript
const artist = await artistsApi.getById(artistId).catch(() => null);

if (artist?.slug && artistId !== artist.slug) {
  permanentRedirect(`/map/${artist.slug}`);
}
```

- `artistId` param 同時接受 Firestore ID 或 slug
- 若 artist 有 slug 且 URL 用的是 ID → 301 redirect 到 slug URL
- `notFound()` 用於 artistId 為空的情況

## Sitemap

`src/app/sitemap.ts`

```typescript
const artistRoutes = artists.map((artist) => ({
  url: `${BASE_URL}/map/${artist.slug ?? artist.id}`,
  // ...
}));
```

## API

- `GET /artists/:id`：接受 Firestore ID 或 slug，response 含 `slug` 欄位
- `GET /artists`（列表）：每筆 artist 含 `slug` 欄位
