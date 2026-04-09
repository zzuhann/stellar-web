---
name: ga4-tracking
description: GA4 事件埋點指南
---

# GA4 事件埋點指南

> **重要**：新增、修改、移除事件時，請同步更新 [docs/events.md](./docs/events.md)

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

所有事件統一使用這些參數：

| 參數         | 說明          | 範例值                      |
| ------------ | ------------- | --------------------------- |
| `event_page` | 事件發生頁面  | `/event/[id]`, `/favorites` |
| `user_id`    | 用戶 ID       | `uid123`（未登入傳空字串）  |
| `content_id` | 相關內容的 ID | `eventId`, `artistId`       |

---

## 埋點方式

### 一般事件

```typescript
import { sendGAEvent } from '@next/third-parties/google';

sendGAEvent('event', 'event_name', {
  event_page: '/current/page',
  user_id: user?.uid ?? '',
  content_id: 'some-id',
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

---

## 事件命名規範

| 類型 | 格式                 | 範例                   |
| ---- | -------------------- | ---------------------- |
| 新增 | `add_to_[目標]`      | `add_to_favorite`      |
| 移除 | `remove_from_[目標]` | `remove_from_favorite` |
| 查看 | `view_[內容]`        | `view_event_detail`    |
| 分享 | `share_[內容]`       | `share_event`          |
| 搜尋 | `search_[對象]`      | `search_artist`        |
| 點擊 | `click_[元素]`       | `click_map_marker`     |
| 提交 | `submit_[表單]`      | `submit_event`         |
| 登入 | `login`              | `login`                |
| 註冊 | `sign_up`            | `sign_up`              |

---

## User Properties

由 `GATracker` 自動設定，**不需要手動帶**：

| 屬性          | 值            | 說明           |
| ------------- | ------------- | -------------- |
| `environment` | `pwa` / `web` | 用戶使用的環境 |

---

## 注意事項

1. **不要帶 `environment`**：已由 GATracker 自動設定
2. **參數名稱用 snake_case**：`event_page` 而非 `eventPage`
3. **未登入時 user_id 傳空字串**：`user?.uid ?? ''`
4. **事件名稱不用設定自訂維度**：GA4 自動收集

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

## 相關檔案

- `docs/events.md` - **已實作事件清單**（新增/修改事件時請更新）
- `src/components/GATracker.tsx` - User Properties 初始化
- `src/hooks/usePageView.ts` - 頁面瀏覽追蹤 hook
- `src/components/PageViewTracker.tsx` - 頁面瀏覽追蹤元件（用於 Server Component）
- `src/utils/pwa.ts` - PWA 模式判斷
