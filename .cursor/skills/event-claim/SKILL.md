---
name: event-claim
description: 活動認領功能 - 前端實作規格
---

# 活動認領功能 - 前端

> **重要**：新增、修改實作時，請同步更新 [docs/implementation.md](./docs/implementation.md)

## 功能概述

讓活動主辦方透過 Threads OAuth 驗證身份，認領由他人投稿的活動，並獲得「已認證主辦」標章。

---

## 設計原則

- **安全跳轉**：OAuth 流程透過後端處理，前端只負責跳轉和結果顯示
- **狀態追蹤**：OAuth 完成後透過 URL 參數傳遞結果

---

## 元件架構

```
EventDetail/
├── index.tsx              # 主元件（整合所有子元件）
├── ClaimEventButton.tsx   # 認領按鈕（發起 OAuth）
├── ClaimResultHandler.tsx # 處理 OAuth callback 結果
└── VerifiedBadge.tsx      # 已認證標章
```

---

## ClaimEventButton

認領按鈕元件，負責發起 OAuth 流程。

### 顯示條件

1. 活動有填寫社群帳號（threads 或 instagram）
2. 當前用戶尚未認領此活動

### 點擊行為

1. 未登入 → 打開登入 modal → 登入後繼續
2. 已登入 → 取得 token → 跳轉到後端 OAuth API

### OAuth URL

```
{API_BASE_URL}/auth/threads
  ?eventId={eventId}
  &redirectUrl={currentPageUrl}
  &token={firebaseIdToken}
```

---

## ClaimResultHandler

處理 OAuth callback 結果，顯示 toast 訊息。

### URL 參數

| 參數   | 值                | 說明         |
| ------ | ----------------- | ------------ |
| claim  | success           | 認領成功     |
| claim  | error             | 認領失敗     |
| reason | cancelled         | 用戶取消授權 |
| reason | username_mismatch | 帳號不符     |
| reason | already_claimed   | 已認領過     |
| reason | oauth_failed      | OAuth 失敗   |
| reason | event_not_found   | 活動不存在   |
| reason | state_expired     | 驗證逾時     |
| reason | unauthorized      | 未登入       |

### 行為

1. 讀取 URL 參數
2. 顯示對應 toast（成功/錯誤）
3. 清除 URL 參數（避免重整時重複顯示）

---

## VerifiedBadge

已認證標章元件，顯示於「主辦」標題旁。

### Props

```typescript
interface VerifiedBadgeProps {
  organizers: VerifiedOrganizer[];
}
```

### 顯示條件

`organizers` 陣列不為空時顯示。

---

## Type 定義

### VerifiedOrganizer（`src/types/index.ts`）

```typescript
interface VerifiedOrganizer {
  userId: string;
  platform: 'threads' | 'instagram';
  username: string;
  verifiedAt: FirebaseTimestamp;
}
```

### CoffeeEvent 新增欄位

```typescript
interface CoffeeEvent {
  // ... 現有欄位 ...
  verifiedOrganizers?: VerifiedOrganizer[];
}
```

---

## 相關檔案

- `docs/implementation.md` - 實作狀態與檔案清單
- `src/types/index.ts` - Type 定義
- `src/components/EventDetail/ClaimEventButton.tsx` - 認領按鈕
- `src/components/EventDetail/ClaimResultHandler.tsx` - 結果處理
- `src/components/EventDetail/VerifiedBadge.tsx` - 認證標章
- `src/components/EventDetail/index.tsx` - 整合元件
