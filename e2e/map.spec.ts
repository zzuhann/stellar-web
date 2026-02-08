import { test, expect } from '@playwright/test';

test.describe('Map', () => {
  test('map without artistId redirects to home', async ({ page }) => {
    await page.goto('/map');
    await expect(page).toHaveURL('/');
  });

  test('can open map from home birthday tab', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /即將到來的生日應援/ })).toBeVisible({
      timeout: 15_000,
    });

    const birthdayTab = page.getByRole('tab', { name: /壽星|生日/ }).first();
    if (await birthdayTab.isVisible()) {
      await birthdayTab.click();
    }

    const mapLink = page
      .getByRole('link', { name: /./ })
      .filter({ has: page.locator('[href^="/map/"]') })
      .first();
    await expect(mapLink).toBeVisible({ timeout: 10_000 });
    const href = await mapLink.getAttribute('href');
    expect(href).toMatch(/^\/map\/.+/);

    await mapLink.click();
    await expect(page).toHaveURL(/\/map\/.+/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
