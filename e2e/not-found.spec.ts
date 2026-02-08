import { test, expect } from '@playwright/test';

test.describe('Not found', () => {
  test('unknown path shows 404 content', async ({ page }) => {
    await page.goto('/no-such-page-404-test');
    await expect(page.getByText('404')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('頁面不存在')).toBeVisible();
  });

  test('not-found has link back to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('link', { name: '回到首頁' })).toBeVisible({ timeout: 5_000 });
  });
});
