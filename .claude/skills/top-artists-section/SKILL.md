---
name: top-artists-section
description: 擁有最多生咖的藝人 - 首頁區塊實作規格
---

# 擁有最多生咖的藝人 - 首頁區塊

> **重要**：新增、修改實作時，請同步更新 [docs/implementation.md](./docs/implementation.md)

## 功能概述

在首頁顯示擁有最多即將到來生咖的藝人，採用 IG Stories 風格的橫向滾動輪播。

---

## 設計規格

### 整體佈局

```
🧚 擁有最多生咖
┌─────────────────────────────────────────────────┐
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐        │
│  │ + │   │ ○ │   │ ○ │   │ ○ │   │ ○ │   →    │
│  └───┘   └───┘   └───┘   └───┘   └───┘        │
│ 新增生咖  藝名     藝名     藝名     藝名        │
│           本名     本名     本名     本名        │
│           12個     10個     8個      6個        │
└─────────────────────────────────────────────────┘
```

### 新增生咖按鈕

- 位置：輪播最前方
- 圖示：`/icon-new.png`（42x42）
- 右下角：藍色圓形加號徽章
- 文字：「新增生咖」
- 點擊行為：
  - 已登入：導向 `/submit-event`
  - 未登入：開啟登入 modal，登入後導向 `/submit-event`

### 藝人卡片

- 頭像：68x68 圓形
- 邊框：stellarBlue 漸層（`linear-gradient(135deg, #3F5A72 0%, #CDE6F4 50%, #344D63 100%)`）
- 內容：藝名、本名（各一行）、生咖數量（`X 個`）
- 點擊：導向 `/map/${artistId}`
- 壽星帽子：當天生日的藝人，頭像右上角顯示 `/party-hat.png`（24x24，`rotate(15deg)`）

### 藝人排序

- 當日壽星排最前（`shouldShowBirthdayHat` 判斷）
- 其餘依 API 原始順序（已按 `upcomingEventCount` 降序）
- 排序邏輯在 `TopArtistsSection` 以 `useMemo` 實作，Carousel 純展示

### 輪播效果

- 使用 Swiper（`slidesPerView: "auto"`）
- 左右漸層提示：滑動到邊緣時隱藏對應漸層
- 無 pagination dots

---

## API

### `GET /api/artists/top?limit=10`

**Response:** `Array<Artist & { upcomingEventCount: number }>`

- `limit` 上限 50
- 無分頁
- 後端已排序（按 `upcomingEventCount` 降序）

---

## GA 事件

| 事件名稱           | 觸發時機     | 參數                                  |
| ------------------ | ------------ | ------------------------------------- |
| `click_top_artist` | 點擊藝人卡片 | `event_page`, `user_id`, `content_id` |

---

## 快取策略

- `staleTime`: 6 小時
- `gcTime`: 7 小時

---

## 相關檔案

- `docs/implementation.md` - 實作位置清單
- `src/lib/api.ts` - `TopArtist` 型別、`artistsApi.getTop()`
- `src/hooks/useHomePage.ts` - `useTopArtistsQuery`
- `src/components/HomePage/components/TopArtistsSection.tsx` - 區塊容器、壽星排序邏輯
- `src/components/HomePage/components/TopArtistCarousel/` - 輪播組件
- `src/components/HomePage/components/TopArtistCarousel/TopArtistCard.tsx` - 藝人卡片、壽星帽子
- `src/utils/birthdayHelpers.ts` - `shouldShowBirthdayHat`
