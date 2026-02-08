import { defineConfig, devices } from '@playwright/test';

/**
 * Base URL for the app. Use env for dev/staging later:
 * - LOCAL: leave unset or BASE_URL=http://localhost:3000
 * - DEV/STAGING: BASE_URL=https://dev.yoursite.com (when you have it)
 * @see https://playwright.dev/docs/test-parameterize#env-files
 */
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

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
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  projects: [
    // Run manually: npx playwright test --project=setup (headed, then sign in with Google)
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: /.*\.auth\.spec\.ts/,
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
