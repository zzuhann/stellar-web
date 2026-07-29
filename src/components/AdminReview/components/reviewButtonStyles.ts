import { cva } from '@/styled-system/css';

// 審核操作按鈕（通過／已存在／拒絕／次要動作）共用樣式
export const reviewButton = cva({
  base: {
    display: 'inline-flex',
    minHeight: '44px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5',
    borderRadius: 'radius.xl',
    paddingX: '3',
    fontSize: 'sm',
    fontWeight: 'semibold',
    cursor: 'pointer',
    border: 'none',
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  variants: {
    kind: {
      secondary: {
        border: '1px solid',
        borderColor: 'color.border.light',
        background: 'white',
        color: 'color.text.primary',
        '&:hover': {
          background: 'gray.50',
        },
      },
      approve: {
        background: 'color.status.success',
        color: 'white',
        '&:hover': {
          background: 'green.700',
        },
      },
      exists: {
        background: 'amber.50',
        color: 'amber.800',
        '&:hover': {
          background: 'color.status.warning',
        },
      },
      reject: {
        background: 'red.50',
        color: 'color.status.error',
        '&:hover': {
          background: 'red.200',
        },
      },
    },
  },
});
