import { test, expect } from '@playwright/test';

test.describe('Event detail', () => {
  test('can open event from home and see detail', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /即將到來的生日應援/ })).toBeVisible({
      timeout: 15_000,
    });

    const eventLink = page
      .getByRole('link', { name: /./ })
      .filter({ has: page.locator('[href^="/event/"]') })
      .first();
    await expect(eventLink).toBeVisible({ timeout: 10_000 });
    const href = await eventLink.getAttribute('href');
    expect(href).toMatch(/^\/event\/.+/);

    await eventLink.click();
    await expect(page).toHaveURL(/\/event\/.+/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('invalid event id shows error or not-found', async ({ page }) => {
    await page.goto('/event/invalid-id-12345');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });
});
