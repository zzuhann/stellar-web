import { test, expect, Page } from '@playwright/test';

/**
 * Typography Screenshots - Authenticated Pages
 *
 * 測試需要登入的頁面在不同 font size 下的呈現
 * 需要先執行 auth.setup.ts 建立登入狀態
 */

// 需要登入的頁面
const AUTH_PAGES = [{ path: '/settings', name: 'settings' }] as const;

// 模擬使用者調整瀏覽器字體大小
const FONT_SIZES = ['16px', '20px', '24px'] as const;

// 手機版 viewport
const MOBILE_VIEWPORT = { width: 375, height: 667 };

async function setBaseFontSize(page: Page, fontSize: string) {
  await page.addStyleTag({
    content: `html { font-size: ${fontSize} !important; }`,
  });
}

test.describe('Typography Screenshots (Auth)', () => {
  for (const testPage of AUTH_PAGES) {
    for (const fontSize of FONT_SIZES) {
      test(`${testPage.name} - mobile - ${fontSize}`, async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);
        await page.goto(testPage.path, { waitUntil: 'networkidle' });

        // 確認已登入（沒被導回首頁）
        await expect(page).toHaveURL(new RegExp(testPage.path));

        await setBaseFontSize(page, fontSize);
        await page.waitForTimeout(300);

        await page.screenshot({
          path: `e2e/screenshots/${testPage.name}-mobile-${fontSize}.png`,
          fullPage: true,
        });
      });
    }
  }
});
