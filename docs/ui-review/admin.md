# UI Review: Admin Page (`/admin`)

Date: 2026-05-29

## Fixed

- `src/components/admin/PageAdmin.tsx:61` — `venueLink` 的 `transition: all` 改具體屬性；補 `&:focus-visible` ring；icon 補 `aria-hidden="true"`
- `src/components/admin/PageAdmin.tsx:91` — `tabButton` 的 `transition: all` 改具體屬性；補 `&:focus-visible` ring
- `src/components/admin/PageAdmin.tsx:204` — `actionButton` 的 `transition: all` 改具體屬性；補 `&:focus-visible` ring（白色 outline 對深色背景）；所有 action button icon 補 `aria-hidden="true"`
- `src/components/admin/PageAdmin.tsx:318` — `batchButton` 的 `transition: all` 改具體屬性；補 `&:focus-visible` ring；所有 batch button icon 補 `aria-hidden="true"`
- `src/components/admin/PageAdmin.tsx` — checkbox 補 `aria-label`（全選藝人/全選生咖/選擇 artist.stageName/選擇 event.title）
- `src/components/admin/RejectModal.tsx:53,124,187` — `closeButton`/`textarea`/`button` 的 `transition: all` 改具體屬性；補 `&:focus-visible` ring；close button 補 `aria-label="關閉"` 和 `type="button"`；XMarkIcon 補 `aria-hidden="true"`
- `src/components/admin/GroupNameModal.tsx:62,94,143,166` — `input`/`button`/`removeButton`/`addButton` 的 `transition: all` 改具體屬性；補 `&:focus-visible` ring；removeButton 補 `aria-label`；PlusIcon/XMarkIcon 補 `aria-hidden="true"`

## Pending Discussion

- `src/components/admin/PageAdmin.tsx:739` — venueLink 使用 `<button>` + onClick 而非 `<Link>`，技術上可以，但語意上導航應使用 `<Link>` 或 `<a>` 以便 right-click 開新分頁
- `src/components/admin/PageAdmin.tsx` — 審核 button 缺 `type="button"`（在 form 外使用，預設行為不影響，但最佳實踐需要加）
- `src/components/admin/GroupNameModal.tsx:271` — 團名 label 未關聯到任何 input（動態列表），無法用 `htmlFor` 關聯，考慮改用 `aria-label` 直接放在 input 上
- `src/components/admin/RejectModal.tsx:295` — textarea 缺 `id` 連結到 label（label 目前沒有 `htmlFor`），錯誤訊息也缺 `aria-describedby`

## Pass

- `RejectModal` 的錯誤訊息顯示在 inline
- checkbox 有適當的 checked 狀態控制
- `GroupNameModal` 有 `role="dialog"` 等結構（透過 ModalOverlay）
- disable 狀態在載入中正確設置
