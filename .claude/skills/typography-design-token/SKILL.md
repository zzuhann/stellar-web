---
name: typography-design-token
description: 套用 typography design tokens 到元件
---

# Typography Design Token 遷移指南

## Token 定義位置

`src/styles/theme.ts`

---

## textStyle 對照表

| 原始樣式                              | Design Token              | 實際值                  |
| ------------------------------------- | ------------------------- | ----------------------- |
| `fontSize: '12px'`                    | `textStyle: 'caption'`    | 12px / normal / 1.5     |
| `fontSize: '14px'`                    | `textStyle: 'bodySmall'`  | 14px / normal / 1.5     |
| `fontSize: '16px'`                    | `textStyle: 'body'`       | 16px / normal / 1.5     |
| `fontSize: '16px', fontWeight: '600'` | `textStyle: 'bodyStrong'` | 16px / semibold / 1.5   |
| `fontSize: '18px'`                    | `textStyle: 'h4'`         | 18px / medium / 1.375   |
| `fontSize: '20px'`                    | `textStyle: 'h3'`         | 20px / semibold / 1.375 |
| `fontSize: '24px'`                    | `textStyle: 'h2'`         | 24px / semibold / 1.25  |
| `fontSize: '28px'`                    | `textStyle: 'h1'`         | 28px / bold / 1.25      |
| `fontSize: '48px'`                    | `textStyle: 'display'`    | 48px / bold / 1.25      |

---

## fontWeight 對照表

| 原始樣式            | Design Token             |
| ------------------- | ------------------------ |
| `fontWeight: '400'` | `fontWeight: 'normal'`   |
| `fontWeight: '500'` | `fontWeight: 'medium'`   |
| `fontWeight: '600'` | `fontWeight: 'semibold'` |
| `fontWeight: '700'` | `fontWeight: 'bold'`     |

---

## 遷移範例

### Before

```typescript
const cardHeader = css({
  fontSize: '16px',
  fontWeight: '600',
  color: 'color.text.primary',
});

const description = css({
  fontSize: '14px',
  color: 'color.text.secondary',
});
```

### After

```typescript
const cardHeader = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const description = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});
```

---

## 覆寫 textStyle 屬性

若需要部分覆寫 textStyle（如保留 fontSize 但改 fontWeight），將覆寫屬性放在 textStyle 之後：

```typescript
const button = css({
  textStyle: 'bodySmall', // fontSize: 14px, fontWeight: normal
  fontWeight: 'semibold', // 覆寫為 semibold
});
```

---

## 常見情境對應

| 使用情境           | 建議 textStyle                                     |
| ------------------ | -------------------------------------------------- |
| 頁面主標題         | `h1`                                               |
| 區塊標題           | `h2` / `h3`                                        |
| 卡片標題           | `h4` / `bodyStrong`                                |
| 內文               | `body`                                             |
| 次要文字、標籤     | `bodySmall`                                        |
| 輔助說明、時間戳記 | `caption`                                          |
| 按鈕文字           | `button` 或 `bodySmall` + `fontWeight: 'semibold'` |
