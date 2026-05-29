# UI Review: Settings Page (`/settings`)

Date: 2026-05-29

## Fixed

- `src/app/settings/page.tsx:78` — `settingItemContainer` 補 `&:hover` 和 `&:focus-visible` ring（`outlineOffset: '-2px'` 因為按鈕有 bottom border）
- `src/app/settings/display-name/page.tsx:71` — `backButton` 的 `transition: all` 改成具體屬性；補 `borderRadius` 和 `&:focus-visible` ring
- `src/app/settings/display-name/page.tsx:119` — `input` 的 `transition: all` 改成具體屬性；`&:focus` 改成 `&:focus-visible`
- `src/app/settings/display-name/page.tsx:163` — `button` 的 `transition: all` 改成具體屬性；補 `&:focus-visible` ring

## Pending Discussion

- `src/app/settings/display-name/page.tsx:305` — `displayName` input 缺 `autocomplete="name"` 和 `name` 屬性，form guidelines 建議 name 欄位加 autocomplete
- `src/app/settings/display-name/page.tsx:133` — `inputError` 只覆蓋 `borderColor` 在 `:focus` 狀態，已更新為 `:focus-visible` 但 `inputError` class 的 focus 覆蓋也需同步更新（沒改以免出錯）

## Pass

- `backButton` 有 `aria-label="返回設定頁面"`
- 裝飾性 icon 有 `aria-hidden="true"`
- `displayName` input 有 `htmlFor`、`aria-invalid`、`aria-describedby` 錯誤連結
- 錯誤訊息有 `role="alert"`
- 儲存按鈕有 loading 狀態 `role="status"` + `aria-live`
- 頁面使用語意化 `h1` 標題
