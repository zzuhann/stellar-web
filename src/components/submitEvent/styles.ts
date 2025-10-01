import { css } from '@/styled-system/css';

export const formGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const label = css({
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '@media (min-width: 768px)': {
    fontSize: '15px',
  },
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
  fontSize: '16px',
  transition: 'all 0.2s ease',
  '&::placeholder': {
    color: 'color.text.disabled',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '15px',
  },
});

export const helperText = css({
  fontSize: '12px',
  color: 'color.text.secondary',
  margin: '0',
  '@media (min-width: 768px)': {
    fontSize: '13px',
  },
});

export const errorText = css({
  fontSize: '12px',
  color: '#ef4444',
  margin: '4px 0 0 0',
});
