# E2E tests (Playwright)

## Quick start

```bash
npm install
npm run test:e2e     # starts dev server if not running, then runs tests
```

Or start the app yourself and run tests (they will reuse the existing server):

```bash
npm run dev          # in one terminal
npm run test:e2e     # in another
```

By default, tests use **Chromium** and start the app with `npm run dev` when not in CI. If you see "port 3000 is already used", either stop the other process or run `npm run dev` first and then `npm run test:e2e`.

## Environment

- **`BASE_URL`** (optional)  
  App URL. Default: `http://localhost:3000`.  
  When you have dev/staging, set before running, e.g.:

  ```bash
  BASE_URL=https://dev.yoursite.com npm run test:e2e
  ```

- **`SLACK_WEBHOOK_URL`** (optional)  
  When set, failed E2E runs send a summary to Slack (e.g. for prod monitoring).

  **What you need for Slack:**
  1. **Slack Incoming Webhook** (recommended)
     - Slack → Manage apps → Build → Create New App → From scratch.
     - Enable **Incoming Webhooks**, add to workspace, **Add New Webhook to Workspace** and pick the channel (e.g. `#alerts`).
     - Copy the webhook URL (e.g. `https://hooks.slack.com/services/T.../B.../xxx`).
  2. Set the env when running tests (e.g. in CI or when running against prod):
     ```bash
     SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... npm run test:e2e
     ```
     Or add `SLACK_WEBHOOK_URL` to your CI secrets.

  The reporter sends: environment (BASE_URL), number of failures, and failed test names + file + error snippet (first 10). No code or sensitive data is sent.

## Test report

After a run, open the HTML report:

```bash
npm run test:e2e:report
```

This opens the last `playwright-report` in the browser (same as Playwright’s tutorial-style report).

## Authenticated tests (Google login)

Tests under `*.auth.spec.ts` use a saved login state so they run as your account (e.g. **debby.cclu@gmail.com**) without logging in every time.

### One-time setup

1. Run the auth setup (browser will open; sign in with Google when the popup appears):

   ```bash
   npm run test:e2e:auth
   ```

2. This saves state to `e2e/.auth/user.json` (gitignored). Re-run when the session expires or after long gaps.

**Note:** Firebase Auth stores session in IndexedDB; Playwright’s storage state only captures cookies and localStorage. If authenticated tests fail after setup, the session may not be restoring—re-run `test:e2e:auth` or consider using the Firebase emulator for E2E in the future.

### Running authenticated tests

After running the auth setup once:

```bash
npx playwright test --project=chromium-authenticated
```

To run all projects (public + authenticated):

```bash
npx playwright test
```

## Scripts

| Script                    | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `npm run test:e2e`        | Run public E2E tests only (starts dev server if needed) |
| `npm run test:e2e:ui`     | Run tests in Playwright UI mode                         |
| `npm run test:e2e:report` | Open last HTML report                                   |
| `npm run test:e2e:auth`   | Run auth setup once (headed; sign in with Google)       |

## Future: dev/staging URLs

When you have fixed dev or staging URLs:

- Run against them: `BASE_URL=https://dev.yoursite.com npm run test:e2e`
- In CI, set `BASE_URL` and optionally `SLACK_WEBHOOK_URL` so failures are reported to Slack (e.g. when running against prod or staging).
