# E2E 重整 — 給工程師的交接事項

PM 重整了 E2E 測試結構（`playwright.config.ts` 與 `e2e/` 已改，屬測試範圍、已完成）。
以下兩件事**在測試範圍外、需要工程師動手**，內容都寫成可直接執行、不需回頭問 PM。

背景（幾句話）：

- 測試改成兩個 bucket：`e2e/regression/`（應永遠綠）、`e2e/known-issues/`（故意紅、不擋 CI）。
- `playwright.config.ts` 的 project 有調整：原本的 `chromium` project **改名為 `regression`**，
  新增 `regression-mobile`（iPhone 13，只跑 `*.mobile.spec.ts`）與 `known-issues`。
- `setup` / `admin-setup` / `chromium-authenticated` / `chromium-admin` 四個 project **不變**。

---

## 1. `package.json` scripts 需要更新

因為 project `chromium` 已改名 `regression`，`package.json` 內引用到 `--project=chromium` 的
script 會壞掉，需要照下面改。**只有 `test:e2e` 與 `test:e2e:ci` 兩行有變、外加兩行新增**，
其餘 script 維持原樣。

### Before（現況，`scripts` 內相關片段）

```jsonc
"test:e2e": "playwright test --project=chromium",
"test:e2e:ui": "playwright test --ui",
"test:e2e:report": "playwright show-report",
"test:e2e:auth": "playwright test --project=setup --project=admin-setup --headed",
"test:e2e:auth:ci": "playwright test --project=setup --project=admin-setup",
"test:e2e:ci": "playwright test --project=chromium --project=chromium-authenticated --project=chromium-admin --pass-with-no-tests",
```

### After（改成這樣）

```jsonc
"test:e2e": "playwright test --project=regression",
"test:e2e:mobile": "playwright test --project=regression-mobile",
"test:e2e:ui": "playwright test --ui",
"test:e2e:report": "playwright show-report",
"test:e2e:auth": "playwright test --project=setup --project=admin-setup --headed",
"test:e2e:auth:ci": "playwright test --project=setup --project=admin-setup",
"test:e2e:ci": "playwright test --project=regression --project=regression-mobile --project=chromium-authenticated --project=chromium-admin --pass-with-no-tests",
"test:e2e:known": "playwright test --project=known-issues --pass-with-no-tests",
```

逐項說明：

- `test:e2e`：`chromium` → `regression`。
- `test:e2e:mobile`（**新增**）：手機回歸集（iPhone 13）。
- `test:e2e:ci`：`chromium` → `regression`，並加上 `--project=regression-mobile`。
- `test:e2e:known`（**新增**）：跑 known-issues bucket。
  - 保留 `--pass-with-no-tests`：目前 `e2e/known-issues/` 是空的，沒有它 Playwright 會因「找不到測試」報錯。

### CI 設定（重要）

`known-issues` 是**故意紅**的，**不可以**擋 merge。請把它排成一個獨立、允許失敗的步驟，
**不要**併進 `test:e2e:ci` 那一輪。例如：

```yaml
# GitHub Actions 範例
- name: E2E regression (gates merge)
  run: npm run test:e2e:ci

- name: E2E known-issues (informational, never blocks)
  run: npm run test:e2e:known || true # 或用 continue-on-error: true
  continue-on-error: true
```

known-issues 的紅燈數量代表「已確認、待修的產品 bug 數量」，是給 PM 看的訊號，不是品質關卡。

---

## 2. 建議補 `role` + `aria-label` 的區塊（可測性）

測試優先用「role + accessible name」定位區塊，這是既有 codebase 已在用的好慣例
（`基本資訊`、`場地列表`、`聯繫這個場地`、`隨機推薦場地`… 都已有）。下列區塊目前**還沒有**
可存取的容器名稱，測試只能改用替代選擇器（`#main-content` id、Leaflet 固定 class、或以永遠存在的
「全部」chip 當錨點）。若能補上，測試會更穩、可讀性更好：

| 頁面                       | 檔案                                     | 目前狀況                                                                               | 建議                                                                                                                       |
| -------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 活動詳情 `/event/[slug]`   | 對應 EventDetail 版面                    | 主內容以 `<div id="main-content">` 定位；主辦社群區、breadcrumb 無 region / aria-label | 主辦社群區與 breadcrumb 各補 `role="region"` / `<nav aria-label>`，讓「主辦社群連結」「活動頁 breadcrumb」等情境可穩定定位 |
| 藝人地圖 `/map/[artistId]` | 對應 MapPage 版面                        | 主內容 `<div id="main-content">`；地圖靠 Leaflet 的 `.leaflet-container` 定位          | 地圖主區塊補 `role="region" aria-label="活動地圖"`（Leaflet class 可暫用，但非我方可控）                                   |
| 場地列表地區篩選 `/venues` | `src/components/venues/VenueFilters.tsx` | 地區 chip 列（`regionRow`）沒有容器角色 / 名稱；只能靠「全部」chip 反推整列            | 幫地區 chip 列補 `role="group" aria-label="地區篩選"`（排序區已有 `role="group" aria-label="場地排序方式"`，比照即可）     |

> 這些都只是「加容器語意」，不改任何互動邏輯；補上後我方會把對應測試的選擇器換成 role-based。

---

## 3. a11y 觀察（待工程師確認，尚未寫成測試）

### 3a. 場地詳情頁 `/venues/[id]` 有 3 個 `<h1>`

PM 於正式站確認（2026-07-21）：`/venues/[id]` 頁面同時存在 3 個 `<h1>`：

| #   | 內容                              | 可見性              | 來源                                                                 |
| --- | --------------------------------- | ------------------- | -------------------------------------------------------------------- |
| (a) | `STELLAR \| 台灣生日應援地圖平台` | sr-only（視覺隱藏） | 全站共用 layout（`src/components/header/index.tsx:103`），每一頁都有 |
| (b) | `{場地名稱}`（例：Stan Cafe）     | visible             | 場地詳情版面（`src/components/venues/VenueDetailView.tsx:296`）      |
| (c) | `{場地名稱}`（與 b 同內容）       | hidden              | 疑似 RWD 桌機 / 手機雙套 DOM，同內容重複                             |

一頁多個 `<h1>` 違反單一 h1 慣例；(c) 的重複更可能是 bug。

**待工程師確認：**

1. (c) 這個 hidden 的重複 h1 是不是刻意的 RWD 做法？（若否，應移除或改用非 h1 標籤）
2. (a) 全站 sr-only h1 與 (b) 頁面主標題，是否要整併成單一 h1？

> 目前**沒有**針對這個寫測試——(c) 是否預期尚未確認，避免製造無法判讀的紅燈。
> 工程師回覆後，PM 會決定是否補測試（可能進 `e2e/known-issues/`）。

### 3b.（背景）首頁 h1 已確認正常

先前一度懷疑首頁缺 `<h1>`，實測（2026-07-21）確認**首頁恰好有 1 個 h1**（即上表的 (a)，
來自全站 layout，grep HomePage component 看不到是因為它不在 HomePage 而在 Header）。
regression 的 A-1 已改為正常斷言「首頁恰好 1 個 h1」，無 partial。

### 3c. 地圖頁 `/map/[artist]` 有 React #418 hydration mismatch

實測（2026-08-09，正式站）：`/map/[artist]` **正常載入**（未拒絕定位）即會拋出
`Uncaught Minified React error #418`（hydration mismatch：SSR 與 client 初次渲染的 HTML 不一致），
且該錯誤 `__sentry_captured__: true`（Sentry 已在收）。

- **影響**：hydration 不一致會導致該區塊在 client 重繪、可能造成閃動 / CLS；也污染錯誤監控。
- **與 geolocation 無關**：拒不拒絕定位都會出現，是地圖頁自身的 SSR/CSR 差異（常見成因：`window`/`localStorage`/
  時間或隨機值在 render 期被讀取、或 client-only 內容未用 `useEffect`/dynamic ssr:false 包起來）。
- **測試處置**：因它**既有且間歇**，E2E 的 F-9（定位被拒）與 H-7（console 乾淨）已將 `#418` 排除，
  避免造成 regression 間歇假紅——但這是**真問題**，請工程師從 Sentry 的 #418 追下去修。修好後可解除那兩處排除。
