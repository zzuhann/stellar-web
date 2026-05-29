# UI Review: Event Detail Page (`/event/[event-slug]`)

Date: 2026-05-29

## Fixed

- `src/components/EventDetail/FavoriteButton.tsx:21,53` — 兩個 class（inactive/active 狀態）的 `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/EventDetail/BackToMapButton.tsx:15` — `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/EventDetail/BackToHomeButton.tsx:14` — `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/EventDetail/ArtistModal.tsx:52,74` — `artistOption` 和 `cancelButton` 的 `transition: all` 改成具體屬性；補 `&:focus-visible` ring
- `src/components/EventDetail/EventBottomBar.tsx:43` — `actionButton` 補 `&:focus-visible` ring（`outlineOffset: '-2px'` 因為按鈕為全高度 flex 容器）
- `src/components/EventDetail/LoginPromptSheet.tsx:56,72` — `primaryButton` 補 `transition` 具體化與 `&:focus-visible` ring；`secondaryButton` 補 `&:focus-visible` ring
- `src/components/EventDetail/DesktopFavoriteButton.tsx:25` — 補 `&:focus-visible` ring

## Pending Discussion

- `src/components/EventDetail/ArtistSection.tsx:17` — `artistItem` 使用 `cursor: pointer` 但它其實是 `<Link>` 包裝，Link 本身不自動繼承 focus ring，需確認 Link 在這個 class 下是否有 `&:focus-visible` 處理（目前沒有，建議補上）
- `src/components/EventDetail/ArtistModal.tsx:111` — overlay 用 `role="button"` + `tabIndex={0}` 讓 overlay 可鍵盤點擊，但 `aria-label="點擊關閉"` 不是很語意化；語意上建議改用 `<button>` 包 overlay，但這需要 UI 結構改動

## Pass

- Icon buttons 全部有 `aria-label`（HeartIcon, ShareIcon, CloseModal 等）
- 裝飾性 icon 全部有 `aria-hidden="true"`
- `DesktopFavoriteButton` 和 `EventBottomBar` 的 favorite button 都有 `aria-pressed`、`aria-busy`
- `ArtistModal` 有完整的 dialog ARIA 語意（`role="dialog"`, `aria-modal`, `aria-labelledby`）
- `LoginPromptSheet` 有 Escape 鍵關閉和手動 focus trap（Tab/Shift+Tab）
- `BottomImagesGallery` 的 button 有 `aria-label` 且已有 `&:focus-visible` ring
- `EventImageGallery` 的圖片 slides 有 `alt` text
- 地圖連結、Instagram、Threads 連結都有 `sr-only` 文字說明「在新視窗開啟」
