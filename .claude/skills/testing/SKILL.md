---
name: testing
description: 前端測試規範（Vitest + React Testing Library）。涵蓋 utils 單元測試、component 測試、常見 mock 模式（next/navigation、react-query、api、toast）、cleanup 注意事項。使用時機：新增前端測試。
---

# 前端測試規範

## 工具

- **Runner**：Vitest（`npm run test`、`npm run test:run`）
- **Component 測試**：`@testing-library/react`
- **指令**：`npx vitest run`（一次性）、`npx vitest`（watch）

## 測試檔位置

- Utils / hooks：與原始檔同目錄，命名 `*.test.ts` / `*.test.tsx`
- Component：與 component 同目錄，命名 `ComponentName.test.tsx`
- E2E：`e2e/*.spec.ts`（Playwright）

## Utils 單元測試

```typescript
import { describe, it, expect } from 'vitest';
import { myUtil } from './myUtil';

describe('myUtil', () => {
  it('描述預期行為', () => {
    expect(myUtil('input')).toBe('expected');
  });
});
```

## Component 測試

```typescript
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MyComponent from './MyComponent';

afterEach(cleanup); // 必要：避免前一個 test 的 DOM 殘留影響下一個

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button', { name: '送出' })).toBeTruthy();
    expect(screen.queryByText('錯誤訊息')).toBeNull();
  });
});
```

**`afterEach(cleanup)` 為必要**，否則前一個 test render 的 DOM 會殘留，導致後面的 `queryBy*` 誤判。

## 常見 Mock 模式

### next/navigation

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/current-path',
}));
```

### @tanstack/react-query（測試顯示邏輯，不測 mutation 行為）

```typescript
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useQuery: () => ({ data: undefined, isLoading: false }),
}));
```

### lib/api

```typescript
vi.mock('@/lib/api', () => ({
  venueApi: {
    updateVenue: vi.fn(),
    permanentDeleteVenue: vi.fn(),
  },
}));
```

### lib/toast

```typescript
vi.mock('@/lib/toast', () => ({
  showToast: { success: vi.fn(), error: vi.fn() },
}));
```

### hooks/queryKey

```typescript
vi.mock('@/hooks/queryKey', () => ({
  default: {
    adminVenues: () => ['admin-venues'],
    venueDetail: (id: string) => ['venue-detail', id],
  },
}));
```

### next/image

```typescript
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));
```

## 時間控制（useFakeTimers）

```typescript
import { beforeEach, afterEach, vi } from 'vitest';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); cleanup(); });

it('時間相關測試', async () => {
  vi.setSystemTime(new Date(2025, 3, 17)); // month 從 0 開始
  await act(async () => { render(<MyComponent />); });
  expect(screen.getByText('今天')).toBeTruthy();
});
```

## 查詢優先順序

| 情境               | 推薦查詢                                |
| ------------------ | --------------------------------------- |
| 按鈕、連結、輸入框 | `getByRole('button', { name: '文字' })` |
| 圖片 alt           | `getByAltText('alt 文字')`              |
| 任意元素文字       | `getByText('文字')`                     |
| 確認不存在         | `queryBy*`（回傳 null 而非 throw）      |
| 等待非同步出現     | `await findBy*`                         |
