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

```env
# Firebase（前端 SDK）
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

NODE_ENV=development
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
