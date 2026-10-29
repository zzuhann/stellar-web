import { css, cva } from '@/styled-system/css';

// Shared styles of the 3-step store form (venue-tags design-frontend §D)

export const srOnly = css({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const stepBody = css({ display: 'flex', flexDirection: 'column', gap: '6' });

export const field = css({ display: 'flex', flexDirection: 'column', gap: '3', minWidth: 0 });

export const fieldset = css({
  margin: 0,
  padding: 0,
  border: 'none',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  // A legend is not a flex item, so gap never reaches it
  '& > legend': { marginBottom: '3' },
});

export const questionLabel = css({
  padding: 0,
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

export const optionalMark = css({
  marginLeft: '1',
  textStyle: 'caption',
  fontWeight: 'normal',
  color: 'color.text.secondary',
});

export const hint = css({ margin: 0, textStyle: 'bodySmall', color: 'color.text.secondary' });

export const input = css({
  width: '100%',
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  '&::placeholder': { color: 'color.text.secondary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '1px' },
  '&[aria-invalid="true"]': { borderColor: 'color.status.error' },
});

export const textarea = css({
  width: '100%',
  minHeight: '120px',
  paddingY: '2.5',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  resize: 'vertical',
  '&::placeholder': { color: 'color.text.secondary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '1px' },
});

// Plain small checkbox rows ("還沒確定…")
export const plainCheckRow = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  minHeight: '44px',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  cursor: 'pointer',
  '& input': { width: '18px', height: '18px', accentColor: 'color.primary', flexShrink: 0 },
});

export const iconButton = css({
  width: '44px',
  height: '44px',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'transparent',
  color: 'color.text.secondary',
  cursor: 'pointer',
  '&:hover:not(:disabled)': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
  '&:active:not(:disabled)': { background: 'gray.100' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
  '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  '& svg': { width: '20px', height: '20px' },
});

// Whole-row selectable card wrapping a visually hidden native input
export const choiceCard = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    minHeight: '48px',
    paddingX: '4',
    paddingY: '3',
    borderRadius: 'radius.lg',
    border: '1px solid',
    borderColor: 'color.border.medium',
    background: 'color.background.primary',
    color: 'color.text.primary',
    cursor: 'pointer',
    '&:has(input:focus-visible)': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '2px',
    },
    '&[data-checked="true"]': {
      borderWidth: '2px',
      borderColor: 'color.primary',
      background: 'alpha.primary.10',
      // Keep the content from shifting when the border thickens
      paddingX: 'calc(token(spacing.4) - 1px)',
      paddingY: 'calc(token(spacing.3) - 1px)',
    },
  },
  variants: {
    invalid: { true: { borderColor: 'color.status.error' } },
  },
});

export const choiceTitle = css({
  textStyle: 'bodyStrong',
  '[data-checked="true"] &': { color: 'stellarBlue.700' },
});

export const choiceDescription = css({
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

// Visible check box drawn next to a hidden native checkbox/radio; not color-only (shows a tick)
export const checkMark = css({
  width: '22px',
  height: '22px',
  flexShrink: 0,
  marginLeft: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'radius.sm',
  border: '1.5px solid',
  borderColor: 'color.border.medium',
  background: 'color.background.primary',
  color: 'transparent',
  '& svg': { width: '16px', height: '16px' },
  '[data-checked="true"] &': {
    background: 'color.primary',
    borderColor: 'color.primary',
    color: 'color.background.primary',
  },
});

export const radioMark = css({
  width: '22px',
  height: '22px',
  flexShrink: 0,
  marginLeft: 'auto',
  borderRadius: 'radius.circle',
  border: '1.5px solid',
  borderColor: 'color.border.medium',
  background: 'color.background.primary',
  '[data-checked="true"] &': {
    borderColor: 'color.primary',
    boxShadow: 'inset 0 0 0 5px var(--colors-color-primary)',
  },
});

export const chipGroup = css({ display: 'flex', flexWrap: 'wrap', gap: '2' });

export const chip = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  minHeight: '44px',
  paddingX: '3.5',
  borderRadius: 'radius.sm',
  border: '1px solid',
  borderColor: 'color.border.medium',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'button',
  cursor: 'pointer',
  '& svg': { display: 'none', width: '16px', height: '16px' },
  '&[data-checked="true"]': {
    borderColor: 'color.primary',
    background: 'alpha.primary.10',
    color: 'stellarBlue.700',
    '& svg': { display: 'block' },
  },
  '&:has(input:focus-visible)': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

export const errorBanner = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  paddingX: '4',
  paddingY: '3',
  borderRadius: 'radius.md',
  background: 'red.50',
  border: '1px solid',
  borderColor: 'red.200',
  textStyle: 'bodySmall',
  color: 'red.800',
});

export const divider = css({
  border: 'none',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  margin: 0,
});

export const sectionHeading = css({ margin: 0, textStyle: 'h3', color: 'color.text.primary' });
