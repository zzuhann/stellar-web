import { css, cva } from '@/styled-system/css';

export const contentCard = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
});

export const actionButtons = css({
  display: 'flex',
  gap: '6px',
  marginTop: '8px',
});

export const actionButton = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 8px',
    borderRadius: 'radius.md',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    background: '#fef2f2',
    borderColor: '#fecaca',
    color: '#991b1b',
    '&:hover:not(:disabled)': {
      background: '#fee2e2',
      borderColor: '#fca5a5',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-sm)',
    },
    '&:active:not(:disabled)': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  variants: {
    variant: {
      edit: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
      },
    },
  },
});
