// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { redactSentryBreadcrumb, redactSentryEvent } from '@/lib/sentryRedaction';

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

  // Privacy: venue-distance-sort sends lat/lng in the GET /venues request URL. The
  // browser SDK's xhr/fetch breadcrumbs and outgoing-request tracing spans would
  // otherwise carry that full URL (query included) straight into Sentry — neither is
  // covered by the backend's Cloud Run log redaction, which only guards the server's
  // own request logs. See src/lib/sentryRedaction.ts.
  beforeBreadcrumb(breadcrumb) {
    return redactSentryBreadcrumb(breadcrumb);
  },
  beforeSend(event) {
    return redactSentryEvent(event);
  },
  beforeSendTransaction(event) {
    return redactSentryEvent(event);
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
