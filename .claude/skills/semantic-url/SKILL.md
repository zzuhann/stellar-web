---
name: semantic-url
description: STELLAR 語義化 URL 實作規格 — artist slug（已上線）與 event slug（開發中）。包含 slug 格式、redirect 邏輯、sitemap 更新、型別定義。後端產生 slug，前端負責 redirect 與 sitemap。
---

# 語義化 URL（Slug）實作規格

## 目標

將 STELLAR 的主要內容頁面從 ID-based URL 改為語義化 URL，提升 SEO 與可讀性。

| 頁面     | 舊 URL                 | 新 URL                | 狀態      |
| -------- | ---------------------- | --------------------- | --------- |
| 藝人地圖 | `/map/{firestoreId}`   | `/map/{artist-slug}`  | ✅ 已上線 |
| 活動詳情 | `/event/{firestoreId}` | `/event/{event-slug}` | ✅ 已上線 |

---

## Artist Slug

> 詳見 [docs/artist-slug.md](./docs/artist-slug.md)

### Slug 格式

由後端維護，人工設定，範例：`bts`、`blackpink`、`txt`

### 前端實作位置

- `src/app/map/[artistId]/page.tsx` — redirect 邏輯（已實作，可作為 event slug 的參考）
- `src/app/sitemap.ts` — `artist.slug ?? artist.id`

---

## Event Slug

> 詳見 [docs/event-slug.md](./docs/event-slug.md)

### Slug 格式

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

### 前端實作位置

- `src/types/index.ts` — `CoffeeEvent` 新增 `slug?: string`
- `src/app/event/[eventId]/page.tsx` — redirect 邏輯（同 artist 作法）
- `src/app/sitemap.ts` — `event.slug ?? event.id`

---

## 通用 Redirect 邏輯

兩種 slug 共用相同模式：

```
URL 進來 /[page]/[id-or-slug]
  ↓
getById(id-or-slug) → 拿到資料（含 slug 欄位）
  ↓
若 slug 存在 && URL param !== slug
  → permanentRedirect(`/[page]/${slug}`)
```

舊 ID URL 自動 301 到新 slug URL，向後兼容。

---

## 相關檔案

- `src/types/index.ts` — Artist、CoffeeEvent 型別定義
- `src/app/map/[artistId]/page.tsx` — Artist slug redirect（參考實作）
- `src/app/event/[eventId]/page.tsx` — Event slug redirect（待實作）
- `src/app/sitemap.ts` — Sitemap 產生
