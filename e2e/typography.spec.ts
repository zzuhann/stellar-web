import { test, Page } from '@playwright/test';

/**
 * Typography Screenshots
 *
 * 在不同 base font size 下截圖，供人工審查
 * 確保使用 rem 單位時，頁面在各種字體大小下不會破版
 */

// 測試頁面
const PUBLIC_PAGES = [
  { path: '/', name: 'home' },
  { path: '/event/D1Otr2o3Du0vLe4ETY7H', name: 'event-detail' },
  { path: '/map/SrO66ZqNkaf9EtURkiWB', name: 'map' },
] as const;

// 模擬使用者調整瀏覽器字體大小
const FONT_SIZES = ['16px', '20px', '24px'] as const;

// 手機版 viewport
const MOBILE_VIEWPORT = { width: 375, height: 667 };

/**
 * 設定 html 的 base font size
 */
async function setBaseFontSize(page: Page, fontSize: string) {
  await page.addStyleTag({
    content: `html { font-size: ${fontSize} !important; }`,
  });
}

/**
 * 準備頁面環境：關閉 banner、modal 等干擾元素
 */
async function preparePageForScreenshot(page: Page) {
  // 設定 localStorage 來隱藏 iOS install banner
  await page.addInitScript(() => {
    localStorage.setItem('ios-install-banner-dismissed', Date.now().toString());
  });
}

/**
 * 展開 map page 的 drawer
 */
async function expandDrawer(page: Page) {
  const handle = page.locator('[role="slider"]');
  const box = await handle.boundingBox();

  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, 300);
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
}

test.describe('Typography Screenshots', () => {
  for (const testPage of PUBLIC_PAGES) {
    for (const fontSize of FONT_SIZES) {
      test(`${testPage.name} - mobile - ${fontSize}`, async ({ page }) => {
        // 設定 viewport
        await page.setViewportSize(MOBILE_VIEWPORT);

        // 準備環境
        await preparePageForScreenshot(page);

        // 前往頁面
        await page.goto(testPage.path, { waitUntil: 'networkidle' });

        // map page 需要展開 drawer
        if (testPage.name === 'map') {
          await expandDrawer(page);
        }

        // 設定 base font size
        await setBaseFontSize(page, fontSize);

        // 等待樣式套用
        await page.waitForTimeout(500);

        // 截圖存檔
        await page.screenshot({
          path: `e2e/screenshots/${testPage.name}-mobile-${fontSize}.png`,
          fullPage: true,
        });
      });
    }
  }
});
