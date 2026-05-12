# Clarity Issue & PR 範本

## GitHub Issue 範本

**標題格式**：`[Clarity] <類型> 發生於 <頁面/元素>`

```markdown
## Clarity 顯示

- 指標：<rage-click / dead-click / scroll-drop / ux-friction>
- 數字：<N 次 或 N% 使用者>
- 時間範圍：過去 3 天（<YYYY-MM-DD> ~ <YYYY-MM-DD>）

## 受影響頁面

- URL / Route：`<path>`
- 元素（若可判斷）：`<selector 或描述>`

## 假設原因

<一句話假設>

## 建議修正方向

<簡短說明>

---

_由 Clarity UX 健診 Skill 自動建立_
```

---

## Draft PR 範本

**標題格式**：`fix: [Clarity] <簡短描述>`

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

---

## Labels 清單

需要在 `zzuhann/stellar-web` repo 預先建立以下 labels：

| Label          | 顏色建議  | 說明                      |
| -------------- | --------- | ------------------------- |
| `clarity`      | `#7B68EE` | 來自 Clarity 數據的 Issue |
| `ux-fix`       | `#FFA500` | UX 修正類 Issue           |
| `priority: p1` | `#FF0000` | 可能壞掉，優先處理        |
| `priority: p2` | `#FF8C00` | 使用摩擦，排進下個 sprint |
| `priority: p3` | `#90EE90` | 輕微，觀察                |
