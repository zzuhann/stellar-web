# UI Review: My Submissions Page (`/my-submissions`)

Date: 2026-05-29

## Fixed

- `src/components/MySubmissions/components/TabNav.tsx:24` — `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/MySubmissions/components/styles.ts:32` — `actionButton` 的 `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/MySubmissions/components/SubmissionsPagination.tsx:25` — `paginationButton` 的 `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/MySubmissions/components/EventSubmissions.tsx:22` — `ctaButton` 的 `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/MySubmissions/components/EventSubmissions.tsx:159,168,179,189` — action button 的裝飾性 icon 補 `aria-hidden="true"`

## Pending Discussion

- `src/components/MySubmissions/components/EventSubmissions.tsx:138` — 未審核/拒絕的活動卡片用 `role="button"` + `<div>` 包裹，是 anti-pattern，但重構需要評估對 VerticalEventCard 的影響
- `src/components/MySubmissions/components/TabNav.tsx:57` — tab button 缺少 `aria-selected` 和 `role="tab"`，目前用純 button 模擬 tab 功能；如要完整符合 ARIA Authoring Practices Guide 的 tab pattern，需補完整的 tablist/tab/tabpanel 結構

## Pass

- 分頁按鈕有 `aria-label`、`disabled` 狀態
- 分頁狀態有 `aria-live="polite"` 即時播報
- delete 操作有 ConfirmModal 確認（destructive action 需確認）
- `SubmissionsPagination` 有 `nav` 包裹、`aria-label`
- CardHeader 使用語意化 `h2`
