import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// 讀取 e2e 專屬的環境設定檔（gitignored；只影響 Playwright，不影響 next dev/build）。
// 想固定對哪個站跑，就在 .env.e2e 寫一行 BASE_URL=...，之後不用每次打前綴。
// 命令列上臨時給的 BASE_URL 仍然優先（dotenv 預設不覆蓋既有的 process.env）。
loadEnv({ path: '.env.e2e' });

/**
 * Base URL for the app. Use env for dev/staging later:
 * - LOCAL: leave unset or BASE_URL=http://localhost:3000
 * - DEV/STAGING/PROD: 在 .env.e2e 設 BASE_URL=https://www.stellar-zone.com
 *   或臨時 BASE_URL=... npx playwright test
 * @see https://playwright.dev/docs/test-parameterize#env-files
 */
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isLocalTarget = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(baseURL);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['./e2e/reporters/slack-reporter.ts'],
    // QA 交付：產出 e2e/reports/summary.md（依 bucket 分區、複製失敗產物到無 hash 路徑）
    ['./e2e/reporters/summary-reporter.ts'],
  ],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    // trace / video 預設關閉；只在 regression / regression-mobile 開 retain-on-failure（見各 project）。
    trace: 'off',
    video: 'off',
  },
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  projects: [
    // ── 手動 setup（不動）：headed 登入後存 storageState ────────────────────
    // Run manually: npx playwright test --project=setup (headed, then sign in with Google)
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    // Run manually: npx playwright test --project=admin-setup (headed, saves an admin session)
    { name: 'admin-setup', testMatch: /admin\.setup\.ts/ },

    // ── regression bucket：應該永遠綠。桌機（Desktop Chrome）─────────────────
    // 排除手機檔、需登入 / admin 的檔（改由對應 project 執行，避免重複跑）。
    {
      name: 'regression',
      testDir: './e2e/regression',
      use: {
        ...devices['Desktop Chrome'],
        // QA 交付：失敗時保留影片與 trace。本機 retries=0，用 retain-on-failure 才會在失敗時留存
        // （舊的 on-first-retry 沒有 retry 就永遠不觸發）。
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
      testIgnore: [/\.setup\.ts/, /\.auth\.spec\.ts/, /\.admin\.spec\.ts/, /\.mobile\.spec\.ts/],
    },

    // ── regression bucket：手機（iPhone 13）。只跑 *.mobile.spec.ts ──────────
    // A-3 漢堡選單、G-1 多寬度溢出、G-5 觸控捲動等手機情境放這裡（本輪尚未撰寫）。
    {
      name: 'regression-mobile',
      testDir: './e2e/regression',
      use: {
        ...devices['iPhone 13'],
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
      testMatch: /.*\.mobile\.spec\.ts/,
    },

    // ── 既有 authenticated / admin（不動）：testMatch 依檔名跨子目錄仍會命中 ──
    // regression/ 內的 *.admin.spec.ts 會被下面的 chromium-admin 抓到（帶 admin storageState）。
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: /.*\.auth\.spec\.ts/,
      testIgnore: /\.setup\.ts/,
    },
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      testMatch: /.*\.admin\.spec\.ts/,
      testIgnore: /\.setup\.ts/,
    },

    // ── known-issues bucket：故意紅（斷言正確行為、產品目前不符）。─────────────
    // 單獨執行、不擋 CI（見 package.json 的 test:e2e:known / HANDOFF.md）。已知會紅，故 retries=0。
    {
      name: 'known-issues',
      testDir: './e2e/known-issues',
      use: {
        ...devices['Desktop Chrome'],
        // 故意紅、每次固定失敗多條，不錄影片 / trace（否則每跑一次就錄一堆預期紅片，純浪費）。
        // 狀態看 summary.md 的 🟡 區即可。
        video: 'off',
        trace: 'off',
      },
      retries: 0,
    },
  ],
  // BASE_URL 指向正式站（非 localhost）時不需要（也不應該）啟動本地 dev server
  webServer: isLocalTarget
    ? {
        command: 'NEXT_PUBLIC_USE_AUTH_EMULATOR=true npm run dev',
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
