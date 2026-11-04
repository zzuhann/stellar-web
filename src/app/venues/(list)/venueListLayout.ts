import { css } from '@/styled-system/css';

// Shared by VenuesClient and loading.tsx so the route-transition skeleton and the real page
// have the same columns and spacing (design-frontend「版面與斷點」)
const wide = '@media (min-width: 768px)';
const desktop = '@media (min-width: 1024px)';

export const page = css({
  minHeight: '100dvh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

export const inner = css({
  maxWidth: '560px',
  marginX: 'auto',
  [wide]: { maxWidth: '1200px' },
});

export const heroSection = css({
  paddingTop: '4',
  paddingX: '4',
  paddingBottom: '4',
  background: 'color.background.primary',
  [wide]: { paddingX: '6' },
});

export const title = css({
  marginTop: '0.5',
  marginX: '0',
  marginBottom: '1.5',
  textStyle: 'h3',
  fontWeight: 'bold',
  color: 'color.text.primary',
  [wide]: { textStyle: 'h1' },
});

export const subtitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

// bodySmall line height (21px); the loading skeleton uses the same height
export const COUNT_ROW_HEIGHT = '21px';

export const countRow = css({
  margin: 0,
  paddingTop: '4',
  paddingX: '4',
  minHeight: COUNT_ROW_HEIGHT,
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  boxSizing: 'content-box',
  [wide]: { paddingX: '6' },
});

export const listSection = css({
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: '4',
  [wide]: { paddingX: '6' },
});

export const cardGrid = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: '4',
  [wide]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6' },
  [desktop]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
});
