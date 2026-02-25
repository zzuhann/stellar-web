/**
 * Run once to save Google login state for authenticated E2E tests.
 * Use your account (e.g. debby.cclu@gmail.com) when the Google popup appears.
 *
 * Run: npx playwright test --project=setup --headed
 * Or:  npm run test:e2e:auth
 */
import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate with Google', async ({ page }) => {
  await page.goto('/my-favorite');

  const googleButton = page.getByRole('button', { name: '使用 Google 登入' });
  await expect(googleButton).toBeVisible({ timeout: 10_000 });

  const [popup] = await Promise.all([
    page.waitForEvent('popup', { timeout: 15_000 }),
    googleButton.click(),
  ]);

  await popup.waitForEvent('close', { timeout: 120_000 });

  await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  await page.context().storageState({ path: authFile });
});
