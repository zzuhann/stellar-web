---
name: query-state
description: 使用 useQueryState 將 UI 狀態同步到 URL query string，讓狀態可分享、可書籤、重整後保留。用於 tab 切換、搜尋條件、篩選器、分頁等需要 URL 持久化的場景。Trigger: 'URL state', 'query string', 'tab 切換', '搜尋條件', '篩選器', 'URL 參數', 'useQueryState'
---

# useQueryState

將 UI 狀態同步到 URL query string 的自訂 hook。讓使用者可以分享網址、書籤、重整後保留狀態。

位置：`src/hooks/useQueryState.ts`

---

## 使用時機

- Tab 切換（`?tab=event`）
- 搜尋關鍵字（`?search=aespa`）
- 篩選條件（`?region=台北`）
- 分頁（`?page=2`）

**不適合用於**：modal 開關（短暫狀態，不需要持久化）、表單 input 草稿。

---

## 基本 API

```typescript
const [value, setValue] = useQueryState(name, options?)
```

| 參數                    | 型別                   | 說明                                |
| ----------------------- | ---------------------- | ----------------------------------- |
| `name`                  | `string`               | URL query 參數名稱                  |
| `options.defaultValue`  | `T`                    | 無 query 參數時的預設值             |
| `options.parse`         | `(value: string) => T` | 自訂解析函式（預設為 string）       |
| `options.defaultMethod` | `'push' \| 'replace'`  | 更新 URL 的方式（預設 `'replace'`） |

| 回傳                        | 說明                                        |
| --------------------------- | ------------------------------------------- |
| `value`                     | 目前的狀態值（有 defaultValue 時不為 null） |
| `setValue(value, options?)` | 更新狀態，傳 `null` 會移除該 query 參數     |

---

## 內建 Parse Functions

```typescript
import {
  parseAsString, // 預設，處理 URI decode + JSON.parse
  parseAsBoolean, // 'true' → true
  parseAsInt, // parseInt
  parseAsFloat, // parseFloat
  parseAsObject, // JSON.parse，失敗回傳 null
  parseAsDate, // new Date(value)
} from '@/hooks/useQueryState';
```

---

## 注意事項

- 需要在 Client Component 中使用（`'use client'`）
- `setValue` 預設用 `replace`（不新增瀏覽器歷史），切換 tab 通常用 replace；導航行為用 `push`
- 傳 `null` 給 setValue 會從 URL 移除這個參數

---

## 範例

詳見 `examples.md`
