# Top Artists Section - 前端實作清單

> 新增、修改實作時請更新此文件

---

## Type 定義

### `TopArtist`（`src/lib/api.ts`）

```ts
export interface TopArtist extends Artist {
  upcomingEventCount: number;
}
```

---

## API Functions

| Function                   | 對應 Endpoint      | 實作位置         | 狀態 |
| -------------------------- | ------------------ | ---------------- | ---- |
| `artistsApi.getTop(limit)` | `GET /artists/top` | `src/lib/api.ts` | ✅   |

---

## Query Hook

| Hook                 | Query Key                | 實作位置                   | 狀態 |
| -------------------- | ------------------------ | -------------------------- | ---- |
| `useTopArtistsQuery` | `['top-artists', limit]` | `src/hooks/useHomePage.ts` | ✅   |

---

## 元件結構

```
HomePage/index.tsx
├── CTAButton
├── TrendingEventsSection          ← 熱門生咖
├── TopArtistsSection              ← 擁有最多生咖（新增）
│   └── TopArtistCarousel
│       ├── 新增生咖按鈕
│       └── TopArtistCard[]
└── WeekNavigation + tabs
```

---

## 元件清單

| 元件                | 位置                                                                     | 狀態 |
| ------------------- | ------------------------------------------------------------------------ | ---- |
| `TopArtistsSection` | `src/components/HomePage/components/TopArtistsSection.tsx`               | ✅   |
| `TopArtistCarousel` | `src/components/HomePage/components/TopArtistCarousel/index.tsx`         | ✅   |
| `TopArtistCard`     | `src/components/HomePage/components/TopArtistCarousel/TopArtistCard.tsx` | ✅   |

---

## 樣式規格

### 藝人頭像

| 屬性    | 值                                                               |
| ------- | ---------------------------------------------------------------- |
| 尺寸    | 68x68px                                                          |
| 邊框    | `linear-gradient(135deg, #3F5A72 0%, #CDE6F4 50%, #344D63 100%)` |
| padding | `0.5`（spacing token）                                           |

### 壽星帽子（`TopArtistCard`）

| 屬性 | 值                                                       |
| ---- | -------------------------------------------------------- |
| 圖片 | `/party-hat.png`                                         |
| 尺寸 | 24x24px                                                  |
| 位置 | `absolute`, `top: -2`, `right: -1`                       |
| 旋轉 | `rotate(15deg)`                                          |
| 條件 | `shouldShowBirthdayHat(artist.birthday ?? '')` 為 `true` |

### 壽星排序（`TopArtistsSection`）

- 使用 `useMemo`，呼叫 `shouldShowBirthdayHat` 判斷
- 當日壽星放入 `today[]`，其餘放入 `others[]`
- 回傳 `[...today, ...others]` 傳給 `TopArtistCarousel`

### 新增按鈕

| 屬性     | 值                       |
| -------- | ------------------------ |
| 圖示     | `/icon-new.png`          |
| 圖示尺寸 | 42x42px                  |
| 加號徽章 | 22x22px, `color.primary` |

### 輪播

| 屬性          | 值       |
| ------------- | -------- |
| spaceBetween  | 12px     |
| slidesPerView | `"auto"` |
| 漸層寬度      | 32px     |

---

## 連結導向

| 元素         | 導向               |
| ------------ | ------------------ |
| 新增生咖按鈕 | `/submit-event`    |
| 藝人卡片     | `/map/${artistId}` |

---

## GA 埋點

| 事件名稱           | 位置                    | 參數                                       |
| ------------------ | ----------------------- | ------------------------------------------ |
| `click_top_artist` | `TopArtistsSection.tsx` | `event_page: '/'`, `user_id`, `content_id` |
