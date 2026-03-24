// 台灣生咖地圖 - Design Token System

// ============================================
// Primitive Tokens（原始色票）
// ============================================
export const primitiveColors = {
  stellarBlue: {
    50: { value: '#CDE6F4' },
    200: { value: '#A3B4C4' },
    500: { value: '#3F5A72' },
    600: { value: '#344D63' },
    700: { value: '#2A4052' },
  },
  gray: {
    0: { value: '#FFFFFF' },
    50: { value: '#F8F9FA' },
    100: { value: '#F1F3F5' },
    200: { value: '#E9ECEF' },
    300: { value: '#DEE2E6' },
    400: { value: '#C7C7C7' },
    500: { value: '#ADB5BD' },
    600: { value: '#666666' },
    700: { value: '#4A4A4A' },
  },
  red: {
    50: { value: '#FEE2E2' },
    200: { value: '#FECACA' },
    500: { value: '#FF6362' },
    600: { value: '#DC3545' },
    700: { value: '#B91C1C' },
    800: { value: '#991B1B' },
  },
  green: {
    50: { value: '#DCFCE7' },
    500: { value: '#10B981' },
    600: { value: '#16A34A' },
    700: { value: '#15803D' },
    800: { value: '#065F46' },
  },
  amber: {
    50: { value: '#FEF3C7' },
    500: { value: '#F59E0B' },
    600: { value: '#D97706' },
    800: { value: '#92400E' },
  },
  sky: {
    50: { value: '#F0F9FF' },
    200: { value: '#BAE6FD' },
    700: { value: '#0369A1' },
  },
  // Alpha colors（透明色）
  alpha: {
    black: {
      5: { value: 'rgba(0, 0, 0, 0.05)' },
      10: { value: 'rgba(0, 0, 0, 0.1)' },
      15: { value: 'rgba(0, 0, 0, 0.15)' },
      20: { value: 'rgba(0, 0, 0, 0.2)' },
      30: { value: 'rgba(0, 0, 0, 0.3)' },
      40: { value: 'rgba(0, 0, 0, 0.4)' },
      50: { value: 'rgba(0, 0, 0, 0.5)' },
      60: { value: 'rgba(0, 0, 0, 0.6)' },
      70: { value: 'rgba(0, 0, 0, 0.7)' },
      90: { value: 'rgba(0, 0, 0, 0.9)' },
    },
    white: {
      30: { value: 'rgba(255, 255, 255, 0.3)' },
      50: { value: 'rgba(255, 255, 255, 0.5)' },
      70: { value: 'rgba(255, 255, 255, 0.7)' },
      80: { value: 'rgba(255, 255, 255, 0.8)' },
      90: { value: 'rgba(255, 255, 255, 0.9)' },
    },
    primary: {
      10: { value: 'rgba(63, 90, 114, 0.1)' },
      20: { value: 'rgba(63, 90, 114, 0.2)' },
    },
    error: {
      5: { value: 'rgba(220, 53, 69, 0.05)' },
      10: { value: 'rgba(220, 53, 69, 0.1)' },
      90: { value: 'rgba(220, 53, 69, 0.9)' },
    },
  },
};

// ============================================
// Semantic Tokens（語意色彩）
// 引用 primitive tokens
// ============================================
export const semanticColors = {
  color: {
    // 主色
    primary: { value: '{colors.stellarBlue.500}' },
    primaryHover: { value: '{colors.stellarBlue.600}' },
    primaryActive: { value: '{colors.stellarBlue.700}' },

    // 文字
    text: {
      primary: { value: '{colors.gray.700}' },
      secondary: { value: '{colors.gray.600}' },
      disabled: { value: '{colors.gray.400}' },
    },

    // 背景
    background: {
      primary: { value: '{colors.gray.0}' },
      secondary: { value: '{colors.gray.50}' },
    },

    // 邊框
    border: {
      light: { value: '{colors.gray.200}' },
      medium: { value: '{colors.gray.300}' },
    },

    // 狀態
    status: {
      success: { value: '{colors.green.600}' },
      warning: { value: '{colors.amber.500}' },
      error: { value: '{colors.red.600}' },
      info: { value: '{colors.sky.700}' },
    },

    // Info 區塊（藍色提示框）
    info: {
      background: { value: '{colors.sky.50}' },
      border: { value: '{colors.sky.200}' },
      text: { value: '{colors.sky.700}' },
    },

    // Heart（愛心/收藏）
    heart: { value: '{colors.red.500}' },
    heartHover: { value: '{colors.red.700}' },

    // 連結
    link: { value: '{colors.stellarBlue.500}' },
    linkHover: { value: '{colors.stellarBlue.600}' },
  },
};

export const shadows = {
  shadow: {
    sm: { value: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    md: { value: '0 2px 8px rgba(0, 0, 0, 0.1)' },
    lg: { value: '0 4px 12px rgba(0, 0, 0, 0.15)' },
    xl: { value: '0 8px 32px rgba(0, 0, 0, 0.1)' },
  },
};

export const borderRadius = {
  radius: {
    sm: { value: '4px' },
    md: { value: '6px' },
    lg: { value: '8px' },
    xl: { value: '12px' },
    circle: { value: '50%' },
  },
};

// ============================================
// Primitive Typography Tokens（原始排版數值）
// ============================================
export const primitiveTypography = {
  fontSizes: {
    xs: { value: '0.75rem' }, // 12px
    sm: { value: '0.875rem' }, // 14px
    base: { value: '1rem' }, // 16px
    lg: { value: '1.125rem' }, // 18px
    xl: { value: '1.25rem' }, // 20px
    '2xl': { value: '1.5rem' }, // 24px
    '3xl': { value: '1.75rem' }, // 28px
    '4xl': { value: '2rem' }, // 32px
    '5xl': { value: '3rem' }, // 48px
  },
  fontWeights: {
    normal: { value: '400' },
    medium: { value: '500' },
    semibold: { value: '600' },
    bold: { value: '700' },
  },
  lineHeights: {
    tight: { value: '1.25' },
    snug: { value: '1.375' },
    normal: { value: '1.5' },
    relaxed: { value: '1.625' },
  },
  letterSpacings: {
    tight: { value: '-0.01em' },
    normal: { value: '0' },
    wide: { value: '0.02em' },
  },
};

// ============================================
// Semantic Typography Tokens（語意排版 - textStyles）
// 用法：css({ textStyle: 'body' })
// ============================================
export const textStyles = {
  // Display - 特殊大標題（如 404 頁面）
  display: {
    value: {
      fontSize: '{fontSizes.5xl}',
      fontWeight: '{fontWeights.bold}',
      lineHeight: '{lineHeights.tight}',
      letterSpacing: '{letterSpacings.tight}',
    },
  },

  // Headings
  h1: {
    value: {
      fontSize: '{fontSizes.3xl}',
      fontWeight: '{fontWeights.bold}',
      lineHeight: '{lineHeights.tight}',
      letterSpacing: '{letterSpacings.tight}',
    },
  },
  h2: {
    value: {
      fontSize: '{fontSizes.2xl}',
      fontWeight: '{fontWeights.semibold}',
      lineHeight: '{lineHeights.tight}',
    },
  },
  h3: {
    value: {
      fontSize: '{fontSizes.xl}',
      fontWeight: '{fontWeights.semibold}',
      lineHeight: '{lineHeights.snug}',
    },
  },
  h4: {
    value: {
      fontSize: '{fontSizes.lg}',
      fontWeight: '{fontWeights.medium}',
      lineHeight: '{lineHeights.snug}',
    },
  },

  // Body - 主要閱讀內容
  body: {
    value: {
      fontSize: '{fontSizes.base}',
      fontWeight: '{fontWeights.normal}',
      lineHeight: '{lineHeights.normal}',
    },
  },
  // Body Strong - 強調內容、小標題
  bodyStrong: {
    value: {
      fontSize: '{fontSizes.base}',
      fontWeight: '{fontWeights.semibold}',
      lineHeight: '{lineHeights.normal}',
    },
  },
  // Body Small - UI 元素、次要內容
  bodySmall: {
    value: {
      fontSize: '{fontSizes.sm}',
      fontWeight: '{fontWeights.normal}',
      lineHeight: '{lineHeights.normal}',
    },
  },

  // UI Elements
  caption: {
    value: {
      fontSize: '{fontSizes.xs}',
      fontWeight: '{fontWeights.normal}',
      lineHeight: '{lineHeights.normal}',
    },
  },
  button: {
    value: {
      fontSize: '{fontSizes.sm}',
      fontWeight: '{fontWeights.medium}',
      lineHeight: '{lineHeights.tight}',
    },
  },
};

// ============================================
// Spacing Tokens（間距）
// Base unit: 4px
// ============================================
export const spacing = {
  0: { value: '0' },
  0.5: { value: '2px' },
  1: { value: '4px' },
  1.5: { value: '6px' },
  2: { value: '8px' },
  2.5: { value: '10px' },
  3: { value: '12px' },
  4: { value: '16px' },
  5: { value: '20px' },
  6: { value: '24px' },
  8: { value: '32px' },
  10: { value: '40px' },
  12: { value: '48px' },
  15: { value: '60px' },
  25: { value: '100px' },
};
