---
name: clarity
description: 透過 Microsoft Clarity MCP 抓取過去 3 天的 UX 行為數據（rage click、dead click、scroll drop），分析並建立 GitHub Issues，針對 P1/P2 問題開 fix branch 與 Draft PR。用於：定期 UX 健診、找出可能壞掉的互動元件、降低使用摩擦。
metadata:
  version: 1.0.0
  category: ux
  updated: 2026-05-12
---

# Clarity UX 健診 Skill

你是一位 UX 工程師，專注於用行為數據找出真實的摩擦點。  
本 skill 會連接 Microsoft Clarity MCP server 與 GitHub，執行完整的「數據 → 分析 → Issue → PR」流程。

---

## 平台背景

- **專案**：STELLAR — 台灣 K-pop 生日咖啡廳活動地圖
- **Tech stack**：Next.js App Router、Firestore、Panda CSS
- **GitHub repo**：`zzuhann/stellar-web`
- **目標用戶**：台灣 K-pop 粉絲，主要行動裝置瀏覽

---

## Step 1 — 抓取 Clarity 數據

透過 Microsoft Clarity MCP server 查詢**過去 3 天**的數據，依序取得：

1. **Rage clicks** — 依頁面 URL，取前 20 筆（按發生次數降序）
2. **Dead clicks** — 依頁面 URL，取前 20 筆
3. **Scroll depth 中斷點** — 依頁面 URL，找出 scroll depth 驟降的頁面（例如 40% → 10%）
4. **Quick backs / Excessive scrolling** — 其他 Clarity 提供的 UX 異常訊號

> 若 MCP server 無法連線或 API 回傳錯誤，明確回報錯誤訊息，不要繼續後續步驟。

---

## Step 2 — 分析與排序優先級

### 過濾規則

**出現次數 < 3 次的問題一律略過。**

### 分類標準

| 類型          | 判斷依據                                    |
| ------------- | ------------------------------------------- |
| `rage-click`  | 同一元素在短時間內被連續點擊 3+ 次          |
| `dead-click`  | 點擊後頁面無任何反應或 DOM 無變化           |
| `scroll-drop` | 頁面在特定深度流失 > 50% 的使用者           |
| `ux-friction` | quick back、excessive scroll 或其他異常訊號 |

### 優先級定義

| 優先級 | 條件                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| `P1`   | 元件可能壞掉（dead click on CTA、rage click on submit button）、影響核心流程   |
| `P2`   | 明顯使用摩擦但功能仍可用（scroll drop on 重要內容、rage click on 非 CTA 元素） |
| `P3`   | 輕微訊號，次要頁面，可觀察不立即修                                             |

### 每個問題輸出格式

```
- 頁面：<URL 或 route pattern>
- 元素：<若可判斷，例如 .submit-button 或「加入最愛」按鈕>
- 類型：rage-click | dead-click | scroll-drop | ux-friction
- 次數：<N 次 / N% 使用者>
- 優先級：P1 | P2 | P3
- 假設原因：<一句話>
```

---

## Step 3 — 建立 GitHub Issues（僅 P1、P2）

針對每個 P1 或 P2 問題，在 `zzuhann/stellar-web` 建立 GitHub Issue：

### Issue 格式

**標題**：`[Clarity] <類型> 發生於 <頁面/元素>`

**Labels**：`clarity`、`ux-fix`、`priority: p1` 或 `priority: p2`

> 若 label 不存在，先用 GitHub API 建立它再 assign。

**Issue 內文範本**：

```markdown
## Clarity 顯示

- 指標：<rage-click / dead-click / scroll-drop / ux-friction>
- 數字：<N 次 或 N% 使用者>
- 時間範圍：過去 3 天（<YYYY-MM-DD> ~ <YYYY-MM-DD>）

## 受影響頁面

- URL / Route：`<path>`
- 元素（若可判斷）：`<selector 或描述>`

## 假設原因

<一句話假設，例如：按鈕外觀看起來可點擊但實際上 disabled>

## 建議修正方向

<簡短說明，例如：檢查 disabled state 的視覺回饋是否清楚>

---

_由 Clarity UX 健診 Skill 自動建立_
```

---

## Step 4 — 修正 code 並開 Draft PR

針對每一個已建立的 Issue，依序執行：

### 4-1. 建立 fix branch

```
fix/clarity-<簡短描述>
```

例如：`fix/clarity-dead-click-favorite-btn`

### 4-2. 找到對應元件

- 根據 Issue 中的 URL / route，對應到 `src/app/` 或 `src/components/` 中的檔案
- 使用 grep 或 find 搜尋關鍵元素的實作位置

### 4-3. 套用修正

常見修正方向（依問題類型）：

| 問題類型             | 常見修正                                                            |
| -------------------- | ------------------------------------------------------------------- |
| Dead click on button | 檢查 `onClick` handler 是否正確綁定；確認非 `disabled` 狀態下的事件 |
| Dead click on link   | 確認 `href` 不為空；確認 `<a>` 或 `<Link>` 包裹正確                 |
| Rage click on form   | 增加 loading state 視覺回饋；防止重複提交                           |
| Scroll drop          | 檢查該深度是否有 layout shift、圖片未載入、或內容被截斷             |
| UX friction          | 視訊號類型判斷，可能是 copy 不夠清楚或 CTA 位置不明顯               |

### 4-4. Commit 格式

```
fix: [Clarity] <簡短描述> (closes #<issue_number>)
```

### 4-5. 開 Draft Pull Request

**PR 標題**：`fix: [Clarity] <簡短描述>`

**PR 內文範本**：

```markdown
## 修正說明

Closes #<issue_number>

## Clarity 數據

- 問題類型：<類型>
- 次數：<N 次>
- 受影響頁面：`<path>`

## 修正內容

- <具體說明改了什麼>

## 測試方式

- [ ] 在受影響頁面確認互動正常
- [ ] 確認修正後無其他 regression

---

_由 Clarity UX 健診 Skill 自動建立，等待 review 後 merge_
```

> **未經 approve，不可自行 merge 或 push 到 main。**  
> PR 開為 Draft 狀態，等待使用者 review。

---

## 執行完成後的回報格式

```
## Clarity UX 健診完成

### 數據摘要
- 查詢時間範圍：<YYYY-MM-DD> ~ <YYYY-MM-DD>
- 發現問題數：<N>（P1: N、P2: N、P3: N）
- 略過（< 3 次）：<N>

### 建立的 GitHub Issues
| Issue | 優先級 | 類型 | 頁面 |
|-------|--------|------|------|
| #<N> <標題> | P1/P2 | <類型> | <path> |

### 開啟的 Draft PRs
| PR | 關聯 Issue | Branch |
|----|------------|--------|
| #<N> <標題> | #<N> | fix/clarity-... |

### P3 問題（觀察，不開 Issue）
- <簡短描述>（<N 次>，<頁面>）
```

---

## 注意事項

1. **不要猜測數據**：若 Clarity MCP 無法回傳，明確說明並停止
2. **修正範圍要保守**：只改與 Clarity 問題直接相關的 code，不做額外重構
3. **每個 Issue 對應一個 PR**：不要把多個問題混在同一個 PR
4. **Panda CSS border 規則**：borderTop/borderBottom 要另外設定 borderTopColor/borderBottomColor
5. **不要 merge**：所有 PR 開為 Draft，等使用者 review

---

## 相關 Skills

- **analytics-tracking** — 若問題涉及事件埋點不足，先規劃埋點再修
- **ga4-tracking** — GA4 埋點實作規格
- **accessibility** — 若 dead click 問題涉及可及性（例如 focus trap、keyboard nav）
