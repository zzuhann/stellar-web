/**
 * Run once to save an admin session for admin-gated E2E tests (e.g. *.admin.spec.ts).
 * Reuses the same Auth Emulator fake-Google login as auth.setup.ts, then grants the
 * resulting emulator user `role: 'admin'` directly in the Firestore emulator so
 * admin-new pages' `userData.role === 'admin'` guard passes.
 *
 * Run: npx playwright test --project=admin-setup --headed
 * Or:  npm run test:e2e:auth:admin
 */
import { test as setup, expect } from '@playwright/test';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const authFile = 'e2e/.auth/admin.json';
// ponytail: 讀 .env.local 沒有的話退回目前唯一在用的專案 id，避免多一個 dotenv 依賴
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'stellar-7b82b';

setup('authenticate as admin (emulator) and grant admin role', async ({ page }) => {
  setup.setTimeout(90_000);
  await page.goto('/');
  const headerButton = page.getByRole('button', { name: '登入 / 註冊' });
  await headerButton.click();

  const googleButton = page.getByRole('button', { name: '使用 Google 登入' });
  await expect(googleButton).toBeVisible({ timeout: 10_000 });

  const [popup] = await Promise.all([
    page.waitForEvent('popup', { timeout: 15_000 }),
    googleButton.click(),
  ]);

  await popup.waitForLoadState();
  await popup.getByRole('button', { name: 'Add new account' }).click();
  await popup.locator('#autogen-button').click();
  await popup.locator('#sign-in').click();
  await popup.waitForEvent('close', { timeout: 120_000 });

  await expect(page.getByRole('button', { name: '登入 / 註冊' })).not.toBeVisible({
    timeout: 30_000,
  });

  const uid = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('firebase:authUser:'));
    if (!key) return null;
    return (JSON.parse(localStorage.getItem(key) as string) as { uid: string }).uid;
  });
  if (!uid) {
    throw new Error('無法取得 emulator 登入後的 uid，Firebase Auth persistence key 格式可能已變');
  }

  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  const app = getApps().length ? getApps()[0] : initializeApp({ projectId: PROJECT_ID });
  await getFirestore(app).collection('users').doc(uid).set({ role: 'admin' }, { merge: true });

  await page.context().storageState({ path: authFile });
});
