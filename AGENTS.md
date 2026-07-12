# stellar-web 前端規範

Next.js (App Router) + TypeScript + PandaCSS 前端，部署於 Vercel。

## 本地開發

```bash
npm run dev    # port 3000
npm run build
npm run lint
```

---

## CSS 框架：PandaCSS

此專案使用 **PandaCSS**

- 設定檔：`panda.config.ts`
- Token 定義：`src/styles/theme.ts`（primitiveColors、semanticColors、spacing、textStyles 等）
- 產生的工具：`styled-system/`（不 commit，由 `npm run prepare` 產生）

```typescript
import { css } from '@/styled-system/css';
import { flex, grid } from '@/styled-system/patterns';

// css() 常數定義在 component 外部
const container = css({ display: 'flex', gap: 'spacing.4' });
```

Token 套用方式參考：`.claude/skills/color-design-token/`、`spacing-design-token/`、`typography-design-token/`

---

## API 呼叫（`src/lib/api.ts`）

Axios 實例，baseURL 為 `NEXT_PUBLIC_API_BASE_URL`，請求攔截器自動附加 Firebase ID Token。

```typescript
// Domain-grouped exports
export const artistsApi = { ... }
export const eventsApi = { ... }
export const usersApi = { ... }
export const favoritesApi = { ... }
export const venuesApi = { ... }
export const placesApi = { ... }
```

**不要**在 component 或 hook 裡直接 import axios，一律透過 `lib/api.ts`。

---

## Query Key 管理（`src/hooks/queryKey.ts`）

集中管理 React Query 的 query key，避免散落各處：

```typescript
const queryKey = {
  birthdayArtists: (startDate, endDate) => ['birthday-artists', startDate, endDate],
  weeklyEvents: (startDate, endDate) => ['weekly-events', startDate, endDate],
  trendingEvents: (limit) => ['trending-events', limit],
  topArtists: (limit) => ['top-artists', limit],
};
```

新增 query 時，優先在這裡新增 key，再用於 hook。

---

## Utils（`src/utils/`）

寫任何新的 util function 前，先看 `src/utils/index.ts`（和同目錄其他檔案）是否已經有相同或相近的邏輯，尤其是日期格式化、字串處理這類容易各寫一份的工具。已有就直接 import 用，不要在 component 或 feature 目錄裡各自重寫一份。若確定需要新增，優先加進 `src/utils/`，不要留在 component 檔案內部。

---

## 目錄結構

```
src/
├── app/                    # App Router 頁面（Server Component 為主）
│   └── [route]/
│       ├── page.tsx        # 只組合區塊，不寫邏輯
│       └── XxxClient.tsx   # 需要 'use client' 的互動塊
├── components/
│   ├── ui/                 # 通用 UI 元件（無業務邏輯）
│   └── FeatureName/        # 功能模組
│       ├── index.tsx
│       ├── components/
│       └── hook/
├── hooks/                  # 全域共用 hooks
├── lib/
│   ├── api.ts              # Axios 實例 + domain-grouped API
│   └── firebase.ts         # Firebase Auth 初始化
├── store/                  # Zustand stores
├── styles/                 # PandaCSS theme tokens、keyframes
├── types/
│   └── index.ts
└── utils/
```

---

## 環境變數

需要新增時，由使用者自己新增，不要讀取、改動 env 檔案

---

## UI 元件規範

### 排序

useState 在 useRef 上方
useEffect 在最下面（return 之上）

### 選單（Dropdown）

**不使用原生 `<select>`**，一律用 custom dropdown button + 浮動選單實作，視覺風格才能統一控制。

標準 pattern（參考 `src/components/admin/venues/PageVenues.tsx`、`src/components/admin/VenueForm/index.tsx`）：

```typescript
// CSS
const dropdownContainer = css({ position: 'relative' });

const dropdownTrigger = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&[data-empty="true"]': { color: 'color.text.tertiary' }, // placeholder 色
  '&:hover': { borderColor: 'color.primary' },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  maxHeight: '240px',
  overflowY: 'auto',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
});
```

```tsx
// Component
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);

// JSX
<div ref={ref} className={dropdownContainer}>
  <button
    type="button"
    className={dropdownTrigger}
    data-empty={!value ? 'true' : undefined}
    onClick={() => setOpen((o) => !o)}
    aria-haspopup="listbox"
    aria-expanded={open}
  >
    <span>{value || '請選擇'}</span>
    <ChevronDownIcon
      className={css({
        width: '14px',
        height: '14px',
        ...(open && { transform: 'rotate(180deg)' }),
      })}
    />
  </button>
  {open && (
    <div className={dropdownMenu} role="listbox">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="option"
          aria-selected={value === opt.value}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
        >
          <span>{opt.label}</span>
          {value === opt.value && <span>✓</span>}
        </button>
      ))}
    </div>
  )}
</div>;
```

---

## 規格文件

功能設計規格在 `specs/features/` 下：

- `specs/features/events/` — 活動資料模型
- `specs/features/event-claim/design-frontend.md` — 活動認領前端設計
- `specs/features/page-view-tracking/design-frontend.md` — 瀏覽量追蹤前端設計
- `specs/features/top-artists/design-frontend.md` — 熱門藝人首頁區塊

---

## 參考 Skills

- `~/.claude/skills/frontend-component/` — 元件設計原則、Server vs Client 拆分
- `~/.claude/skills/mobile-first/` — RWD 斷點規範（PandaCSS 版本）
- `~/.claude/skills/design-token/` — PandaCSS token 系統
- `.claude/skills/semantic-url/` — STELLAR URL/slug 規格
- `.claude/skills/color-design-token/` — 顏色 token 套用
- `.claude/skills/testing/` — 前端測試規範（Vitest + RTL）：component 測試、mock 模式、cleanup 注意事項
