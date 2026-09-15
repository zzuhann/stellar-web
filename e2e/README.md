# E2E tests (Playwright)

## 目錄結構與 buckets

測試分成兩個 bucket，各對應一個（或多個）Playwright project：

| 目錄                | 意義                                                    | project                                                                                        | 執行方式                                                  |
| ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `e2e/regression/`   | **應該永遠綠**。紅 = 有東西壞了                         | `regression`（桌機 Desktop Chrome）、`regression-mobile`（iPhone 13，只跑 `*.mobile.spec.ts`） | 進 CI、擋 merge                                           |
| `e2e/known-issues/` | **故意紅**（斷言正確行為、產品目前不符）。變綠 = 修好了 | `known-issues`（桌機）                                                                         | 獨立執行、**不擋 merge**，見 `e2e/known-issues/README.md` |
| `e2e/helpers/`      | 共用函式（`firstCard`、`expectImageLoaded`）            | —                                                                                              | —                                                         |

還在根目錄、未進 bucket 的檔案：

- `auth.setup.ts` / `admin.setup.ts` — 手動跑一次存 storageState（`setup` / `admin-setup` project）
- `map-new.spec.ts` — 舊 `/map-new/` 路由測試，路由已改名 `/map/`，**整支註解中、待重整**（不是產品壞了，故不進 known-issues）
- `my-favorite.auth.spec.ts` — 需登入，維持註解，暫不在範圍

### 手機測試檔名慣例：`*.mobile.spec.ts`

手機情境（漢堡選單、觸控捲動、多寬度溢出…）放 `e2e/regression/xxx.mobile.spec.ts`，只會由 `regression-mobile`（iPhone 13）執行，桌機 project 會忽略它，不會整套跑兩遍。

> ⚠️ **注意**：這個檔名慣例的前提是「一支 spec 只跑桌機**或**只跑手機」。
> 如果之後需要「**同一支 spec 同時跑桌機和手機**」，檔名慣例會擋住（一個檔案只能被一個裝置 project 選中）。
> 屆時要改用 **tag**（例如在 test 標題加 `@mobile`，config 用 `--grep` / `--grep-invert` 分流）。**現在先不要為此做任何預留設計。**

## ⚠️ 對正式站(BASE_URL)例行執行「不包含」哪些測試

`regression/` 裡不是每一支都會出現在對正式站的例行執行中。看到全綠時請注意下列測試**根本沒被跑到**：

- **`regression/admin-review.admin.spec.ts`**：檔名是 `*.admin.spec.ts`，只由 `chromium-admin` project 執行，需要 **admin storageState（`e2e/.auth/admin.json`）+ Firestore emulator** 才能過 `role==='admin'` 守衛。對正式站的例行 run（不帶 admin 登入、非 emulator）**不會**包含它。→ 全綠 **不代表**後台審核也驗過了。
- **`regression-mobile` 的 `*.mobile.spec.ts`**：要視你的例行指令有沒有帶 `--project=regression-mobile`。
- 需登入的 `*.auth.spec.ts`（目前只有註解中的 my-favorite）：只由 `chromium-authenticated` 執行。

換句話說，對正式站最單純的一輪 `--project=regression` 只涵蓋**公開、未登入、桌機**的情境。

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
