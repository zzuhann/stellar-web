import { css, cva } from '@/styled-system/css';

export const contentCard = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
});

export const actionButtonsContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5',
});

export const actionButtons = css({
  display: 'flex',
  gap: '1.5',
});

export const actionButton = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    paddingY: '1.5',
    paddingX: '2',
    borderRadius: 'radius.md',
    textStyle: 'caption',
    fontWeight: 'semibold',
    transition:
      'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    background: 'red.50',
    borderColor: 'red.200',
    color: 'red.800',
    '&:hover:not(:disabled)': {
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
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '2px',
    },
  },
  variants: {
    variant: {
      edit: {
        background: 'gray.0',
        borderColor: 'gray.200',
        color: 'gray.700',
      },
    },
  },
});
