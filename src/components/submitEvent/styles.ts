import { css } from '@/styled-system/css';

export const formGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const label = css({
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '& svg': {
    width: '18px',
    height: '18px',
    color: 'color.text.secondary',
  },
});

export const input = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  transition: 'all 0.2s ease',
  '&::placeholder': {
    color: 'color.text.disabled',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
  },
});

export const helperText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  margin: '0',
});

export const errorText = css({
  textStyle: 'caption',
  color: 'red.600',
  margin: '4px 0 0 0',
});
