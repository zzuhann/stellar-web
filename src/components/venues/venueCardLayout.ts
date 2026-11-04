import { css } from '@/styled-system/css';

// Shared by the cards and their skeletons so a skeleton swaps for a card without a layout shift.
// Heights assume a full card: 2-line name (48) + transit (18) + 2 tag rows (22 + 6 + 22) + divider (1)
// + bottom row, with 8px gaps and 12px padding top and bottom. Two tag rows because three short
// tags wrap on the ~226px homepage card (venue-tags §A).
// List: bottom is one row (21) -> 194. Home: bottom is two stacked rows (21 + 4 + 21) -> 219.
export const VENUE_CARD_BODY_MIN_HEIGHT = '194px';
export const VENUE_HOME_CARD_BODY_MIN_HEIGHT = '219px';
export const VENUE_HOME_CARD_COVER_HEIGHT = '160px';

// List cover ratio, used by the cover and its skeleton
export const venueCardListRatio = css({
  aspectRatio: '16 / 10',
  '@media (min-width: 768px)': { aspectRatio: '4 / 3' },
});
