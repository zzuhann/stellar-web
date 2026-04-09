---
name: spacing-design-token
description: 套用 spacing design tokens 到元件
---

# Spacing Design Token 遷移指南

## Token 定義位置

`src/styles/theme.ts`

---

## Spacing Token 對照表

Base unit: 4px

| Token   | 值    | 常見用途                    |
| ------- | ----- | --------------------------- |
| `'0'`   | 0     | 重置間距                    |
| `'0.5'` | 2px   | 極小間距、icon 與文字間     |
| `'1'`   | 4px   | 緊湊元素間距、tag 內距      |
| `'1.5'` | 6px   | 小型按鈕內距                |
| `'2'`   | 8px   | 常用小間距、列表項間距      |
| `'2.5'` | 10px  | 輸入框內距                  |
| `'3'`   | 12px  | 中等間距、按鈕內距          |
| `'4'`   | 16px  | 常用標準間距、卡片內距      |
| `'5'`   | 20px  | 大間距、區塊內距            |
| `'6'`   | 24px  | 區塊間距、section gap       |
| `'8'`   | 32px  | 大區塊間距                  |
| `'10'`  | 40px  | 頁面區塊間距                |
| `'12'`  | 48px  | 大型區塊間距                |
| `'15'`  | 60px  | 頁面底部間距                |
| `'25'`  | 100px | 頁面頂部間距（header 高度） |

---

## 遷移範例

### Before

```typescript
const card = css({
  padding: '16px',
  gap: '8px',
  marginBottom: '12px',
});

const pageContainer = css({
  padding: '100px 16px 40px',
});

const button = css({
  padding: '10px 16px',
});
```

### After

```typescript
const card = css({
  padding: '4',
  gap: '2',
  marginBottom: '3',
});

const pageContainer = css({
  paddingTop: '25',
  paddingX: '4',
  paddingBottom: '10',
});

const button = css({
  paddingY: '2.5',
  paddingX: '4',
});
```

---

## 用法說明

### 基本用法

Spacing tokens 可用於所有間距相關屬性：

```typescript
const example = css({
  // Padding
  padding: '4', // 全部 16px
  paddingX: '4', // 左右 16px
  paddingY: '2', // 上下 8px
  paddingTop: '25', // 上 100px

  // Margin
  margin: '4',
  marginX: 'auto', // auto 仍可使用
  marginBottom: '3',

  // Gap
  gap: '2',
  columnGap: '4',
  rowGap: '3',

  // Position
  top: '4',
  left: '2',
});
```

### 注意事項

1. **使用字串**：Token key 是數字，但必須用字串包裹

   ```typescript
   // ✅ 正確
   padding: '4';

   // ❌ 錯誤
   padding: 4;
   ```

2. **複合值需拆分**：多值寫法會被當成 px，必須拆成個別屬性

   ```typescript
   // ❌ 錯誤 - '2 4' 會被解讀為 '2px 4px'，不會對應 token
   padding: '4 6'

   // ✅ 正確 - 使用 paddingX / paddingY
   paddingX: '6',
   paddingY: '4',

   // ✅ 或完全拆分
   paddingTop: '4',
   paddingRight: '6',
   paddingBottom: '4',
   paddingLeft: '6',
   ```

3. **特殊值**：`auto`、`0`、百分比等仍可直接使用

   ```typescript
   margin: '0 auto',     // 仍可使用
   marginX: 'auto',      // 或用這個寫法
   margin: '1px' or margin: '-1px' // 仍可使用
   ```

4. **負數值**：在 token 前加 `-` 即可

   ```typescript
   // Before
   top: '-8px',
   right: '-4px',

   // After
   top: '-2',    // -8px
   right: '-1',  // -4px
   ```

5. width, height 相關不更改
6. 如果有遇到不確定要不要更改 可以先跳過
7. admin 跳過

---

## 常見情境對應

| 使用情境         | 建議 Token                         |
| ---------------- | ---------------------------------- |
| 卡片內距         | `padding: '4'` (16px)              |
| 卡片間距         | `gap: '4'` (16px)                  |
| 列表項間距       | `gap: '2'` (8px)                   |
| 按鈕內距         | `paddingY: '2.5'`, `paddingX: '4'` |
| 輸入框內距       | `padding: '2.5'` (10px)            |
| Modal 內距       | `padding: '5'` (20px)              |
| 區塊間距         | `gap: '6'` (24px)                  |
| 頁面容器上間距   | `paddingTop: '25'` (100px)         |
| 頁面容器下間距   | `paddingBottom: '10'` (40px)       |
| 頁面容器左右間距 | `paddingX: '4'` (16px)             |

---

## 響應式用法

```typescript
const container = css({
  paddingX: '4',
  md: {
    paddingX: '6',
  },
});
```
