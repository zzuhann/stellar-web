# Event Claim - 前端實作清單

> 實作完成於 2026-04-15

---

## Type 定義

| 檔案                 | 異動內容                                 | 狀態   |
| -------------------- | ---------------------------------------- | ------ |
| `src/types/index.ts` | 新增 `VerifiedOrganizer` interface       | 已完成 |
| `src/types/index.ts` | `CoffeeEvent` 新增 `verifiedOrganizers?` | 已完成 |

---

## 元件

| 元件                 | 位置                                                | 狀態   |
| -------------------- | --------------------------------------------------- | ------ |
| `ClaimEventButton`   | `src/components/EventDetail/ClaimEventButton.tsx`   | 已完成 |
| `ClaimResultHandler` | `src/components/EventDetail/ClaimResultHandler.tsx` | 已完成 |
| `VerifiedBadge`      | `src/components/EventDetail/VerifiedBadge.tsx`      | 已完成 |

---

## 整合

| 檔案                                   | 異動內容                      | 狀態   |
| -------------------------------------- | ----------------------------- | ------ |
| `src/components/EventDetail/index.tsx` | 引入並使用 ClaimEventButton   | 已完成 |
| `src/components/EventDetail/index.tsx` | 引入並使用 ClaimResultHandler | 已完成 |
| `src/components/EventDetail/index.tsx` | 引入並使用 VerifiedBadge      | 已完成 |

---

## 環境變數

| 變數名                     | 說明          | 狀態 |
| -------------------------- | ------------- | ---- |
| `NEXT_PUBLIC_API_BASE_URL` | 後端 API 網址 | 已有 |

---

## 測試案例

| 測試情境                           | 預期結果                       |
| ---------------------------------- | ------------------------------ |
| 未登入點擊認領                     | 顯示登入 modal                 |
| 登入後點擊認領                     | 跳轉到 Threads OAuth           |
| OAuth 成功後返回（?claim=success） | 顯示成功 toast，URL 參數被清除 |
| OAuth 失敗後返回（?claim=error）   | 顯示錯誤 toast，URL 參數被清除 |
| 活動無社群帳號                     | 不顯示認領按鈕                 |
| 用戶已認領過此活動                 | 不顯示認領按鈕                 |
| 活動有 verifiedOrganizers          | 顯示「已認證主辦」標章         |

---

## UI 位置

### 活動詳情頁結構（修改後）

```
EventDetail
├── PageViewTracker
├── EventViewTracker
├── ClaimResultHandler          ← 新增（處理 OAuth callback）
├── SwiperBanner
└── contentSection
    ├── FavoriteButton
    ├── ClaimEventButton        ← 新增（認領按鈕）
    ├── eventTitle
    ├── ArtistSection
    ├── 「主辦」+ VerifiedBadge ← 新增（認證標章）
    ├── socialMedia links
    ├── 時間/地點
    ├── 詳細說明
    ├── 圖片
    └── BackToMapButton
```
