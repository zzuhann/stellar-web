# UI Review: Map Page (`/map/[artist-slug]`)

Date: 2026-05-29

## Fixed

- `src/components/map/components/LocationButton.tsx:23` — `transition: all` 改成具體屬性 (`background`, `border-color`, `box-shadow`, `transform`, `opacity`)；補 `&:focus-visible` ring
- `src/components/map/components/Drawer/DrawerHandleBar.tsx:60` — `transition: all` 改成具體屬性 (`background`, `border-color`, `transform`)；補 `&:focus-visible` ring 到 close button

## Pending Discussion

- `src/components/map/components/Drawer/index.tsx` — Drawer 使用 `position: fixed` + `overscroll-behavior: contain` 尚未設定；Drawer 在 modal 語意上應該加 `overscroll-behavior: contain` 防止背景頁面跟著滾動，但 Drawer 本身是自訂拖曳元件，需確認是否會影響現有的拖曳手勢
- `src/components/map/components/Drawer/DrawerHandleBar.tsx` — `drawerHandle` 使用 `touchAction: 'none'`，這個設定可能和 `touch-action: manipulation` 衝突；目前的設定是為了讓自訂的拖曳手勢能正確運作，不應改動，只記錄
- `src/components/map/MapPage.tsx` — `prefers-reduced-motion` 未處理：`MapCenterUpdater` 在移動地圖中心時使用了 `animate: true, duration: 0.5`，但沒有依 `prefers-reduced-motion` 條件關閉動畫，因為這是 Leaflet 地圖 API 呼叫，需在 hook 層做條件判斷
- `src/components/map/MapPage.tsx` — `usePageShare` 直接呼叫 `window.location.href`，但 `window` 在 SSR 不可用（雖然整個 MapPage 已 dynamic import with ssr: false，實際上不會出問題，記錄供參考）

## Pass

- Icon buttons 全部有 `aria-label`（LocationButton、close button）
- 裝飾性 icon 全部有 `aria-hidden="true"`
- DrawerHandleBar 有完整的 ARIA slider 語意（`role="slider"`, `aria-label`, `aria-valuenow` 等）
- MarkerCluster 的 cluster icon 有 `role="img"` 和 `aria-label`
- EmptyState 的 Image 有正確的 `alt` text
- MemoizedMarker 有 `title` 和 `alt` 屬性
- Drawer handle 有 `tabIndex={0}` 且有鍵盤事件 handler（ArrowUp/Down/Enter/Space）
