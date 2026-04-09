---
name: playwright-screenshot
description: use playwright to take a screenshot of a webpage
---

# Playwright Screenshot 操作指南

## 常用指令

| 指令                                                   | 用途                               |
| ------------------------------------------------------ | ---------------------------------- |
| `npx playwright test typography.spec.ts`               | 產生 typography 截圖               |
| `npx playwright test --ui`                             | 開啟 Playwright UI 互動式測試      |
| `npm run test:e2e:auth`                                | 執行認證設定（需手動 Google 登入） |
| `npx playwright test --project=chromium-authenticated` | 執行需登入的頁面測試               |

---

## 產生 Typography 截圖

### 執行截圖

```bash
npx playwright test typography.spec.ts
```

截圖會存放在 `e2e/screenshots/` 目錄：

- `home-mobile-16px.png` - 預設字體大小
- `home-mobile-20px.png` - 放大 1.25 倍
- `home-mobile-24px.png` - 放大 1.5 倍

### 新增頁面

編輯 `e2e/typography.spec.ts`，在 `PUBLIC_PAGES` 新增：

```typescript
const PUBLIC_PAGES = [
  { path: '/', name: 'home' },
  { path: '/map', name: 'map' }, // 新增
  { path: '/events', name: 'events' }, // 新增
] as const;
```

### 只跑特定頁面

```bash
npx playwright test typography.spec.ts -g "home"
```

---

## 需登入頁面截圖

### 步驟 1：建立登入狀態

```bash
npm run test:e2e:auth
```

這會開啟瀏覽器，讓你手動登入 Google。登入後，Playwright 會把 session 存到 `playwright/.auth/user.json`。

### 步驟 2：執行認證測試

```bash
npx playwright test --project=chromium-authenticated typography.auth.spec.ts
```

關鍵是 `--project=chromium-authenticated`，這會載入之前存的登入狀態。

### 新增需登入頁面

編輯 `e2e/typography.auth.spec.ts`：

```typescript
const AUTH_PAGES = [
  { path: '/settings', name: 'settings' },
  { path: '/my-submissions', name: 'my-submissions' }, // 新增
  { path: '/my-favorite', name: 'my-favorite' }, // 新增
] as const;
```

### 運作原理

`playwright.config.ts` 設定了 `chromium-authenticated` project，會載入 `storageState: user.json`（已登入的 cookies/session）。

---

## 測試 Modal 截圖

建立 `e2e/modal.spec.ts`：

```typescript
import { test } from '@playwright/test';

test.describe('Modal Screenshots', () => {
  test('login-modal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 點擊觸發 modal 的按鈕
    await page.click('[data-testid="login-button"]');

    // 等待 modal 出現
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'e2e/screenshots/login-modal.png',
      fullPage: false,
    });
  });
});
```

---

## 目錄結構

```
e2e/
├── screenshots/              # 截圖存放位置
│   ├── home-mobile-16px.png
│   ├── home-mobile-20px.png
│   └── home-mobile-24px.png
├── typography.spec.ts        # 公開頁面截圖
├── typography.auth.spec.ts   # 需登入頁面截圖
└── auth.setup.ts             # 認證設定
```

---

## 常見問題

### Q: 認證測試被導回登入頁？

Session 過期了，重新執行認證設定：

```bash
npm run test:e2e:auth
```

### Q: `user.json` 不存在？

首次使用需先建立登入狀態：

```bash
npm run test:e2e:auth
```

### Q: 想在 CI 跑截圖？

```bash
CI=true npx playwright test typography.spec.ts
```
