import { css } from '@/styled-system/css';

// Page shell and grid shared by VenueDetailV2 and the route's loading skeleton, so the
// skeleton lines up with the real page (no 'use client' here: loading.tsx is a server file)

// Flex column so the sticky contact bar rests at the viewport bottom even on short pages
export const pageOuter = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

export const shell = css({
  flexGrow: 1,
  width: '100%',
  maxWidth: '640px',
  marginX: 'auto',
  paddingTop: '3',
  paddingBottom: '10',
  lg: { maxWidth: '1200px', paddingX: '6', paddingTop: '6' },
});

// One DOM for both widths (map iframe and photos render once). DOM order is the mobile order;
// desktop places the same blocks into named areas. Desktop spacing uses margins, not row-gap,
// so a missing block leaves no double gap behind.
export const detailLayout = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6',
  '& > :empty': { display: 'none' },
  lg: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 360px',
    // Last row absorbs extra height when the right column is taller than the left
    gridTemplateRows: 'repeat(7, auto) 1fr',
    gridTemplateAreas: `"header header" "photos photos" "usage aside" "facilities aside" "description aside" "events aside" "related aside" "correction aside"`,
    columnGap: '12',
    rowGap: '0',
    '& > * + *': { marginTop: '8' },
  },
});

export const areaHeader = css({ lg: { gridArea: 'header' } });
export const areaPhotos = css({ lg: { gridArea: 'photos' } });
export const areaUsage = css({ lg: { gridArea: 'usage' } });
export const areaFacilities = css({ lg: { gridArea: 'facilities' } });
export const areaDescription = css({ lg: { gridArea: 'description' } });
export const areaEvents = css({ lg: { gridArea: 'events' } });
export const areaRelated = css({ lg: { gridArea: 'related' } });
export const areaCorrection = css({ lg: { gridArea: 'correction' } });

// Spans every left-column row so the contact card inside stays sticky the whole way down
export const areaAside = css({
  lg: {
    gridArea: 'aside',
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    minWidth: 0,
  },
});
