---
name: ga4-tracking
description: GA4 事件埋點指南
---

# GA4 事件埋點指南

## 設計原則

- **Event Name 要 Specific**：用事件名稱區分動作類型，不用額外參數
- **參數要通用**：用少量通用參數，避免達到自訂維度上限

```
事件 (Event)
├── 事件名稱：add_to_favorite（specific，區分動作）
├── 事件參數 (Event Parameters)：event_page, user_id, content_id（通用）
└── 使用者屬性 (User Properties)：environment（自動帶）
```

---

## 通用參數

所有事件統一使用這些參數，不需要為每個事件設計獨特參數：

| 參數         | 說明          | 範例值                      |
| ------------ | ------------- | --------------------------- |
| `event_page` | 事件發生頁面  | `/event/[id]`, `/favorites` |
| `user_id`    | 用戶 ID       | `uid123`（未登入傳空字串）  |
| `content_id` | 相關內容的 ID | `eventId`, `idolId`         |

---

## 已設定的 User Properties

由 `GATracker` 自動設定，**不需要手動帶**：

| 屬性          | 值            | 說明           |
| ------------- | ------------- | -------------- |
| `environment` | `pwa` / `web` | 用戶使用的環境 |

---

## 埋點流程

### Step 1: 決定事件名稱

用 specific 的名稱區分動作：

```typescript
// ✅ 好：用事件名稱區分動作
sendGAEvent('event', 'add_to_favorite', { ... });
sendGAEvent('event', 'remove_from_favorite', { ... });

// ❌ 不好：用參數區分動作
sendGAEvent('event', 'click_favorite', { is_favorited: true });
```

### Step 2: 帶上通用參數

```typescript
import { sendGAEvent } from '@next/third-parties/google';

sendGAEvent('event', 'add_to_favorite', {
  event_page: '/event/[id]',
  user_id: user?.uid ?? '',
  content_id: eventId,
});
```

### Step 3: 確認自訂維度已設定

通用參數只需要設定一次，之後所有事件都可以用。

---

## 程式碼範例

### 收藏/取消收藏

```typescript
sendGAEvent('event', isFavorited ? 'remove_from_favorite' : 'add_to_favorite', {
  event_page: '/event/[id]',
  user_id: user?.uid ?? '',
  content_id: eventId,
});
```

### 分享

```typescript
sendGAEvent('event', 'share_event', {
  event_page: '/event/[id]',
  user_id: user?.uid ?? '',
  content_id: eventId,
});
```

### 搜尋

```typescript
sendGAEvent('event', 'search_event', {
  event_page: '/search',
  user_id: user?.uid ?? '',
  content_id: keyword, // 搜尋關鍵字
});
```

### 頁面瀏覽 (page_view)

使用 `usePageView` hook 或 `PageViewTracker` 元件：

```typescript
// Client Component 使用 hook
import { usePageView } from '@/hooks/usePageView';

function MyPage() {
  usePageView({ eventPage: '/my-page', contentId: 'optional-id' });
  return <div>...</div>;
}

// Server Component 使用元件
import PageViewTracker from '@/components/PageViewTracker';

function ServerPage({ id }: { id: string }) {
  return (
    <div>
      <PageViewTracker eventPage="/page/[id]" contentId={id} />
      ...
    </div>
  );
}
```

### 登入/註冊

```typescript
sendGAEvent('event', 'login', {
  event_page: '/login',
  user_id: user.uid,
  content_id: '', // 無相關內容
});
```

---

## 事件命名規範

| 類型 | 格式                 | 範例                   |
| ---- | -------------------- | ---------------------- |
| 新增 | `add_to_[目標]`      | `add_to_favorite`      |
| 移除 | `remove_from_[目標]` | `remove_from_favorite` |
| 查看 | `view_[內容]`        | `view_event_detail`    |
| 分享 | `share_[內容]`       | `share_event`          |
| 搜尋 | `search_[對象]`      | `search_event`         |
| 點擊 | `click_[元素]`       | `click_nav_link`       |
| 提交 | `submit_[表單]`      | `submit_contact_form`  |
| 登入 | `login`              | `login`                |
| 註冊 | `sign_up`            | `sign_up`              |

---

## GA4 後台設定

### 自訂維度設定步驟

1. GA4 後台 → 管理 (齒輪)
2. 資料顯示 → **自訂定義**
3. 建立自訂維度

### 已設定的自訂維度

| 維度名稱    | 參數名稱      | 範圍   | 設定日期 |
| ----------- | ------------- | ------ | -------- |
| Environment | `environment` | 使用者 | 20260406 |
| Event Page  | `event_page`  | 事件   | 20260406 |
| User ID     | `user_id`     | 事件   | TODO     |
| Content ID  | `content_id`  | 事件   | TODO     |

---

## 注意事項

1. **不要帶 `environment`**：已由 GATracker 自動設定
2. **參數名稱用 snake_case**：`event_page` 而非 `eventPage`
3. **未登入時 user_id 傳空字串**：`user?.uid ?? ''`
4. **事件名稱不用設定自訂維度**：GA4 自動收集

---

## 相關檔案

- `src/components/GATracker.tsx` - User Properties 初始化
- `src/hooks/usePageView.ts` - 頁面瀏覽追蹤 hook
- `src/components/PageViewTracker.tsx` - 頁面瀏覽追蹤元件（用於 Server Component）
- `src/utils/pwa.ts` - PWA 模式判斷
