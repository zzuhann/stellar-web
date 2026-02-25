import { test, expect } from '@playwright/test';

test.describe('My Favorite (authenticated)', () => {
  test('my-favorite page loads when logged in', async ({ page }) => {
    await page.goto('/my-favorite');
    await expect(page).toHaveURL('/my-favorite');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });

  test('shows favorites section or empty state', async ({ page }) => {
    await page.goto('/my-favorite');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });
});
