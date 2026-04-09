---
name: color-design-token
description: 套用 color design tokens 到元件
---

# Color Design Token 遷移指南

## Token 定義位置

`src/styles/theme.ts`

---

## Semantic Color Tokens（語意色彩）

### 主色 Primary

| Token                 | 用途        | 對應 Primitive  |
| --------------------- | ----------- | --------------- |
| `color.primary`       | 主要品牌色  | stellarBlue.500 |
| `color.primaryHover`  | 主色 hover  | stellarBlue.600 |
| `color.primaryActive` | 主色 active | stellarBlue.700 |

### 文字 Text

| Token                  | 用途     | 對應 Primitive     |
| ---------------------- | -------- | ------------------ |
| `color.text.primary`   | 主要文字 | gray.700 (#4A4A4A) |
| `color.text.secondary` | 次要文字 | gray.600 (#666666) |
| `color.text.disabled`  | 禁用文字 | gray.400 (#C7C7C7) |

### 背景 Background

| Token                        | 用途     | 對應 Primitive    |
| ---------------------------- | -------- | ----------------- |
| `color.background.primary`   | 主要背景 | gray.0 (#FFFFFF)  |
| `color.background.secondary` | 次要背景 | gray.50 (#F8F9FA) |

### 邊框 Border

| Token                 | 用途     | 對應 Primitive     |
| --------------------- | -------- | ------------------ |
| `color.border.light`  | 淺色邊框 | gray.200 (#E9ECEF) |
| `color.border.medium` | 中等邊框 | gray.300 (#DEE2E6) |

### 狀態 Status

| Token                  | 用途     | 對應 Primitive      |
| ---------------------- | -------- | ------------------- |
| `color.status.success` | 成功狀態 | green.600 (#16A34A) |
| `color.status.warning` | 警告狀態 | amber.500 (#F59E0B) |
| `color.status.error`   | 錯誤狀態 | red.600 (#DC3545)   |
| `color.status.info`    | 資訊狀態 | sky.700 (#0369A1)   |

### Info 區塊（藍色提示框）

| Token                   | 用途       | 對應 Primitive    |
| ----------------------- | ---------- | ----------------- |
| `color.info.background` | 提示框背景 | sky.50 (#F0F9FF)  |
| `color.info.border`     | 提示框邊框 | sky.200 (#BAE6FD) |
| `color.info.text`       | 提示框文字 | sky.700 (#0369A1) |

### 其他

| Token              | 用途       | 對應 Primitive    |
| ------------------ | ---------- | ----------------- |
| `color.heart`      | 愛心/收藏  | red.500 (#FF6362) |
| `color.heartHover` | 愛心 hover | red.700 (#B91C1C) |
| `color.link`       | 連結       | stellarBlue.500   |
| `color.linkHover`  | 連結 hover | stellarBlue.600   |

---

## Primitive Color Tokens（原始色票）

直接使用 primitive token 時，需加上 `colors.` 前綴：

| Token                    | 色碼    |
| ------------------------ | ------- |
| `colors.stellarBlue.50`  | #CDE6F4 |
| `colors.stellarBlue.200` | #A3B4C4 |
| `colors.stellarBlue.500` | #3F5A72 |
| `colors.stellarBlue.600` | #344D63 |
| `colors.stellarBlue.700` | #2A4052 |
| `colors.gray.0`          | #FFFFFF |
| `colors.gray.50`         | #F8F9FA |
| `colors.gray.100`        | #F1F3F5 |
| `colors.gray.200`        | #E9ECEF |
| `colors.gray.300`        | #DEE2E6 |
| `colors.gray.400`        | #C7C7C7 |
| `colors.gray.500`        | #ADB5BD |
| `colors.gray.600`        | #666666 |
| `colors.gray.700`        | #4A4A4A |
| `colors.red.50`          | #FEE2E2 |
| `colors.red.500`         | #FF6362 |
| `colors.red.600`         | #DC3545 |
| `colors.red.700`         | #B91C1C |
| `colors.green.50`        | #DCFCE7 |
| `colors.green.500`       | #10B981 |
| `colors.green.600`       | #16A34A |
| `colors.amber.50`        | #FEF3C7 |
| `colors.amber.500`       | #F59E0B |
| `colors.sky.50`          | #F0F9FF |
| `colors.sky.200`         | #BAE6FD |
| `colors.sky.700`         | #0369A1 |

### Alpha Colors（透明色）

| Token                     | 值                       |
| ------------------------- | ------------------------ |
| `colors.alpha.black.5`    | rgba(0, 0, 0, 0.05)      |
| `colors.alpha.black.10`   | rgba(0, 0, 0, 0.1)       |
| `colors.alpha.black.50`   | rgba(0, 0, 0, 0.5)       |
| `colors.alpha.white.50`   | rgba(255, 255, 255, 0.5) |
| `colors.alpha.white.80`   | rgba(255, 255, 255, 0.8) |
| `colors.alpha.primary.10` | rgba(63, 90, 114, 0.1)   |
| `colors.alpha.primary.20` | rgba(63, 90, 114, 0.2)   |
| `colors.alpha.error.10`   | rgba(220, 53, 69, 0.1)   |

---

## 遷移範例

### Before

```typescript
const card = css({
  backgroundColor: '#FFFFFF',
  borderColor: '#E9ECEF',
  color: '#4A4A4A',
});

const errorText = css({
  color: '#DC3545',
});

const link = css({
  color: '#3F5A72',
  _hover: {
    color: '#344D63',
  },
});
```

### After

```typescript
const card = css({
  backgroundColor: 'color.background.primary',
  borderColor: 'color.border.light',
  color: 'color.text.primary',
});

const errorText = css({
  color: 'color.status.error',
});

const link = css({
  color: 'color.link',
  _hover: {
    color: 'color.linkHover',
  },
});
```

---

## 常見情境對應

| 使用情境           | 建議 Token                   |
| ------------------ | ---------------------------- |
| 頁面/卡片背景      | `color.background.primary`   |
| 區塊背景（灰底）   | `color.background.secondary` |
| 主要內文           | `color.text.primary`         |
| 次要說明文字       | `color.text.secondary`       |
| 禁用狀態文字       | `color.text.disabled`        |
| 按鈕主色           | `color.primary`              |
| 按鈕 hover         | `color.primaryHover`         |
| 分隔線/淺色邊框    | `color.border.light`         |
| 輸入框邊框         | `color.border.medium`        |
| 錯誤訊息           | `color.status.error`         |
| 成功訊息           | `color.status.success`       |
| 警告訊息           | `color.status.warning`       |
| 連結文字           | `color.link`                 |
| 收藏按鈕（已收藏） | `color.heart`                |
| 提示區塊背景       | `color.info.background`      |

---

## 注意事項

1. **優先使用 Semantic Token**：除非有特殊需求，否則應使用語意化的 token（如 `color.text.primary`）而非 primitive token（如 `colors.gray.700`）

2. **邊框顏色設定**：使用 Panda CSS 時，`borderTop` 或 `borderBottom` 需另外設定 `borderTopColor` 或 `borderBottomColor`

3. **避免硬編碼色碼**：不要直接寫 `#4A4A4A`，應使用對應的 token
