# UI Review: Submit Event Page (`/submit-event`)

Date: 2026-05-29

## Fixed

- `src/components/submitEvent/ActionButtons.tsx:26` — `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/submitEvent/EventSubmissionForm.tsx:107` — `emailInput` 的 `transition: all` 改成具體屬性（`border-color`, `box-shadow`）
- `src/components/submitEvent/EventInfoSection.tsx:28` — `textarea` 的 `transition: all` 改成具體屬性
- `src/components/submitEvent/ChooseArtistSection.tsx:19` — `artistSelectionButton` 的 `transition: all` 改成具體屬性
- `src/components/submitEvent/ChooseArtistSection.tsx:82` — `removeButtonStyle` 的 `transition: all` 改成具體屬性
- `src/components/submitEvent/StepIndicator.tsx:27,93` — `step-number` 和 `stepConnector` 的 `transition: all` 改成具體屬性
- `src/components/submitEvent/styles.ts:33` — 共用 `input` style 的 `transition: all` 改具體屬性；`&:focus` 改成 `&:focus-visible`（原本 `outline: none` + `boxShadow` 是合法的替代 focus indicator，但 `:focus` 應改為 `:focus-visible`）

## Pending Discussion

- `src/components/submitEvent/EventSubmissionForm.tsx:586` — 匿名用戶的 email input 缺 `name` 屬性和 `autocomplete="email"`，form guidelines 要求 email 欄位需加 `autocomplete`
- `src/components/submitEvent/ChooseArtistSection.tsx:123` — `artistSelectionButton` 在已選藝人時使用 `role="button"` + `<div>` 而不是 `<button>`，這是 anti-pattern，但改動可能影響現有的 stopPropagation 邏輯，需討論是否值得重構
- `src/components/submitEvent/EventInfoSection.tsx:266` — `textarea` 的 `description` 欄位沒有 `autocomplete` 屬性，但這是自由文字欄位，`autocomplete="off"` 可能更符合使用者預期

## Pass

- 所有表單欄位都有 `htmlFor` 或 `id` 連結 label
- 必填欄位有 `aria-required="true"` 且 sr-only 說明
- 錯誤訊息都有 `role="alert"` 且 `id` 連結 `aria-describedby`
- `StepIndicator` 有 `nav` 包裹、`aria-label`、`aria-current="step"`
- `ChooseArtistSection` 的 removeButton 有 `aria-label` 和 `&:focus-visible` ring
- `description` textarea 有字數計數 `aria-live="polite"`
