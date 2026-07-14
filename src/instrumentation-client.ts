// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Filter out browser extension errors
  ignoreErrors: [
    'Invalid call to runtime.sendMessage()',
    /chrome-extension:\/\//,
    /moz-extension:\/\//,
    // Safari/iOS IndexedDB quirk inside Firebase Auth's internal persistence
    // sync — connection closes mid-transaction, no user-facing effect.
    "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
