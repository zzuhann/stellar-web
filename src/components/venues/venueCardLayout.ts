// Shared by the cards and their skeletons so a skeleton swaps for a card without a layout shift.
// Heights assume a full card: 2-line name (48) + transit (18) + 1 tag row (22) + divider (1)
// + bottom row, with 8px gaps and 12px padding top and bottom.
// List: bottom is one row (21). Home: bottom is two stacked rows (21 + 4 + 21).
export const VENUE_CARD_BODY_MIN_HEIGHT = '166px';
export const VENUE_HOME_CARD_BODY_MIN_HEIGHT = '191px';
export const VENUE_HOME_CARD_COVER_HEIGHT = '160px';
