import { css } from '@/styled-system/css';

export const sectionTitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

export const externalIcon = css({
  flexShrink: 0,
  color: 'currentColor',
});

// Text links that must still offer a 44px tall hit area
export const textLink = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  minHeight: '44px',
  color: 'color.link',
  fontWeight: 'medium',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  '&:hover': { color: 'color.linkHover' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
    borderRadius: 'radius.sm',
  },
});

export const tag = css({
  display: 'inline-flex',
  alignItems: 'center',
  paddingY: '0.5',
  paddingX: '2',
  borderRadius: 'radius.sm',
  // Brand blue pair, same as the usage check dot; #2A4052 on #CDE6F4 is 8.3:1
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  textStyle: 'caption',
  lg: { textStyle: 'bodySmall' },
});
