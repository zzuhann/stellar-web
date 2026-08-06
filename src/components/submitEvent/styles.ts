import { css } from '@/styled-system/css';

export const formGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

export const label = css({
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  '& svg': {
    width: '18px',
    height: '18px',
    color: 'color.text.secondary',
  },
});

export const input = css({
  width: '100%',
  paddingY: '3',
  paddingX: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&::placeholder': {
    color: 'color.text.disabled',
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
});

export const helperText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  margin: '0',
});

export const helperTextWarning = css({
  textStyle: 'caption',
  margin: '0',
  color: 'amber.500',
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

export const errorText = css({
  textStyle: 'caption',
  color: 'red.600',
  marginTop: '1',
});

export const sectionDivider = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '6',
  marginTop: '6',
});

export const sectionTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginBottom: '2',
});

// 以下幾個是「預約開始時間」欄位（日期+時間並排、清空按鈕）專用的樣式，
// EventSubmissionForm 的 EventInfoSection 與 EventImportForm 共用，見兩邊的
// 「預約資訊」區塊——放在共用 styles.ts 避免兩處各寫一份
export const reservationTimeRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3',
});

export const reservationTimeField = css({
  flex: '1',
  minWidth: '140px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

export const captionLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

export const reservationLabelRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2',
});

export const clearReservationButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  minHeight: '44px',
  paddingX: '3',
  border: 'none',
  background: 'transparent',
  color: 'color.text.secondary',
  textStyle: 'caption',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  transition: 'color 0.2s ease, background 0.2s ease',
  '&:hover': {
    color: 'red.600',
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});
