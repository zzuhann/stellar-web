// 台灣生咖地圖 - 品牌色彩系統
export const theme = {
  colors: {
    // 主色：霧藍 - 帶星球感的穩定基調
    primary: '#5A7D9A',

    // 輔助色：柔霧藍 - 提升層次感
    secondary: '#A3B4C4',

    // 強調色：星光金 - 溫暖的重點提示
    accent: '#F5D398',

    // 文字色系
    text: {
      primary: '#4A4A4A', // 主要文字
      secondary: '#666666', // 次要文字
      disabled: '#999999', // 禁用文字
    },

    // 背景色系
    background: {
      primary: '#FFFFFF', // 主背景
      secondary: '#F8F9FA', // 次要背景
      muted: '#F1F3F5', // 淡色背景
    },

    // 邊框色系
    border: {
      light: '#E9ECEF', // 淺色邊框
      medium: '#DEE2E6', // 中等邊框
      dark: '#ADB5BD', // 深色邊框
    },

    // 狀態色系
    status: {
      success: '#28A745', // 成功
      warning: '#FFC107', // 警告
      error: '#DC3545', // 錯誤
      info: '#17A2B8', // 資訊
    },
  },

  // 陰影效果
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },

  // 圓角
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '50%',
  },

  // 斷點
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
} as const;

// 類型定義
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;

// 顏色輔助函數
export const colorUtils = {
  // 獲取帶透明度的顏色
  withOpacity: (color: string, opacity: number) =>
    `${color}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0')}`,

  // 主色變化
  primary: {
    light: '#7A9DB8', // 主色淺化
    dark: '#3A5D7A', // 主色深化
    muted: '#8AA5BA', // 主色柔化
  },

  // 輔助色變化
  secondary: {
    light: '#C3D4E4', // 輔助色淺化
    dark: '#8394A4', // 輔助色深化
    muted: '#B3C4D4', // 輔助色柔化
  },

  // 強調色變化
  accent: {
    light: '#F8E3B8', // 強調色淺化
    dark: '#E5C378', // 強調色深化
    muted: '#F2D8A8', // 強調色柔化
  },
};

// CSS 變數匯出（用於全域樣式）
export const cssVariables = {
  '--color-primary': theme.colors.primary,
  '--color-secondary': theme.colors.secondary,
  '--color-accent': theme.colors.accent,
  '--color-text-primary': theme.colors.text.primary,
  '--color-text-secondary': theme.colors.text.secondary,
  '--color-text-disabled': theme.colors.text.disabled,
  '--color-bg-primary': theme.colors.background.primary,
  '--color-bg-secondary': theme.colors.background.secondary,
  '--color-bg-muted': theme.colors.background.muted,
  '--color-border-light': theme.colors.border.light,
  '--color-border-medium': theme.colors.border.medium,
  '--color-border-dark': theme.colors.border.dark,
  '--shadow-sm': theme.shadows.sm,
  '--shadow-md': theme.shadows.md,
  '--shadow-lg': theme.shadows.lg,
  '--radius-sm': theme.borderRadius.sm,
  '--radius-md': theme.borderRadius.md,
  '--radius-lg': theme.borderRadius.lg,
} as const;
