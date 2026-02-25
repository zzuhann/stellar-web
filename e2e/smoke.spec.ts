import { test, expect } from '@playwright/test';

test.describe('Smoke – Home', () => {
  test('home page loads and shows main content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/STELLAR|生日應援/);
    await expect(page.getByRole('link', { name: 'STELLAR' }).first()).toBeVisible();
  });

  test('header has logo and main nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'STELLAR' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /投稿/ })).toBeVisible();
  });

  test('home shows upcoming events section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /即將到來的生日應援/ })).toBeVisible({
      timeout: 15_000,
    });
  });
});
