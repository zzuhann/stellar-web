import { test as base } from '@playwright/test';

// E2E may run against production (BASE_URL); keep test runs out of Sentry and analytics
const TELEMETRY =
  /^https?:\/\/([^/]+\.)?(sentry\.io|clarity\.ms|google-analytics\.com|googletagmanager\.com)\/|\/_vercel\/(insights|speed-insights)\//;

export const test = base.extend({
  context: async ({ context }, provide) => {
    await context.route(TELEMETRY, (route) => route.fulfill({ status: 204 }));
    await provide(context);
  },
});

export { expect } from '@playwright/test';
export type { Page, Route } from '@playwright/test';
