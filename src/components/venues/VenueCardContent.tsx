import { UsersIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import type { Venue } from '@/types';
import { formatTransitHeader, getVenueHeaderTransit } from '@/utils/transitStops';
import type { VenueCardTagItem } from '@/utils/venueTags';
import { CAPACITY_RANGE_LABEL } from './venueCapacity';
import { VENUE_CARD_BODY_MIN_HEIGHT, VENUE_HOME_CARD_BODY_MIN_HEIGHT } from './venueCardLayout';
import VenueCardCoverClient from './VenueCardCoverClient';
import MrtIcon from './MrtIcon';

// The <a> shell shared by the list card and the homepage card
export const venueCardLink = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  color: 'color.text.primary',
  textDecoration: 'none',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  boxShadow: 'shadow.sm',
  transition: 'box-shadow 150ms ease-out, transform 150ms ease-out',
  '&:hover': { boxShadow: 'shadow.md' },
  '@media (prefers-reduced-motion: no-preference)': {
    '&:hover': { transform: 'translateY(-2px)' },
  },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '2px' },
});

const body = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  paddingX: '4',
  paddingY: '3',
});

const nameRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '2',
});

const venueName = css({
  margin: 0,
  minWidth: 0,
  textStyle: 'body',
  fontWeight: 'bold',
  color: 'color.text.primary',
  overflow: 'hidden',
  display: '-webkit-box',
  lineClamp: 2,
});

const regionBadge = css({
  flexShrink: 0,
  textStyle: 'caption',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  borderRadius: '9999px',
  paddingX: '2',
  paddingY: '1',
  whiteSpace: 'nowrap',
});

const transitRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

// flex:1 + minWidth:0 lets a long station name truncate instead of pushing the distance out
const transitInfo = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  flex: '1',
  minWidth: '0',
});

const transitText = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const mrtIconWrap = css({ display: 'flex', flexShrink: 0 });

// marginLeft:auto (not space-between) keeps the distance on the right when it is the only item
const distanceInfo = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  flexShrink: '0',
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
});

const tagRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5',
});

const tagPill = css({
  paddingY: '0.5',
  paddingX: '2',
  borderRadius: 'radius.sm',
  background: 'gray.100',
  textStyle: 'caption',
  color: 'color.text.primary',
});

// marginTop:auto pins divider and bottom row to the card bottom so same-row cards line up
const footer = css({
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const sectionDivider = css({
  borderTop: '1px dashed',
  borderColor: 'gray.200',
});

const bottomStats = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  fontVariantNumeric: 'tabular-nums',
});

// The homepage card is narrow (~260px), so the two stats stack
const bottomStatsStacked = css({
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '1',
});

const statItem = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
});

const capacityTextCls = css({ color: 'color.text.primary', fontWeight: 'semibold' });
const eventCountNum = css({ color: 'color.primary', fontWeight: 'bold' });
const starIconCls = css({ color: 'amber.500' });

interface VenueCardContentProps {
  venue: Venue;
  tags: VenueCardTagItem[];
  // Pre-formatted by the list card; the homepage card never passes it
  distanceText?: string | null;
  variant: 'list' | 'home';
}

// First non-empty photo (empty strings are skipped, same rule as the detail page)
const getCoverPhoto = (venue: Venue): string | null =>
  [venue.coverPhoto, ...(venue.otherPhotos ?? [])].find(Boolean) ?? null;

export default function VenueCardContent({
  venue,
  tags,
  distanceText,
  variant,
}: VenueCardContentProps) {
  const coverPhoto = getCoverPhoto(venue);
  const transit = getVenueHeaderTransit(venue);
  const hasTransitRow = Boolean(transit || distanceText);
  const hasBottom = Boolean(venue.capacityRange || venue.eventCount > 0);
  const hasDivider = hasBottom && (hasTransitRow || tags.length > 0);
  // /venues has only its h1 above the cards; the homepage nests them under an h2
  const NameHeading = variant === 'list' ? 'h2' : 'h3';

  return (
    <>
      <VenueCardCoverClient key={coverPhoto ?? ''} src={coverPhoto} variant={variant} />
      <div
        className={body}
        style={{
          minHeight:
            variant === 'home' ? VENUE_HOME_CARD_BODY_MIN_HEIGHT : VENUE_CARD_BODY_MIN_HEIGHT,
        }}
      >
        <div className={nameRow}>
          <NameHeading
            className={venueName}
            style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {venue.name}
          </NameHeading>
          <span className={regionBadge}>{venue.region}</span>
        </div>

        {hasTransitRow && (
          <div className={transitRow} data-testid="transit-row">
            {transit && (
              <div className={transitInfo}>
                {(transit.type === 'mrt' || transit.type === 'light_rail') && (
                  <span className={mrtIconWrap} data-testid="mrt-icon">
                    <MrtIcon size={16} />
                  </span>
                )}
                <span className={transitText}>{formatTransitHeader(transit)}</span>
              </div>
            )}
            {distanceText && (
              <span className={distanceInfo}>
                <MapPinIcon aria-hidden="true" width={14} height={14} />
                {distanceText}
              </span>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className={tagRow} data-testid="tag-row">
            {tags.map((tag) => (
              <span key={tag.slug} className={tagPill}>
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {hasBottom && (
          <div className={footer}>
            {hasDivider && <div className={sectionDivider} data-testid="section-divider" />}
            <div
              className={`${bottomStats} ${variant === 'home' ? bottomStatsStacked : ''}`}
              data-testid="bottom-row"
            >
              {venue.capacityRange && (
                <span className={statItem}>
                  <UsersIcon aria-hidden="true" width={14} height={14} />
                  可容納{' '}
                  <strong className={capacityTextCls}>
                    {CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange}
                  </strong>
                </span>
              )}
              {venue.eventCount > 0 && (
                <span className={statItem}>
                  <StarIcon aria-hidden="true" width={14} height={14} className={starIconCls} />
                  <strong className={eventCountNum}>{venue.eventCount}</strong> 場生日應援紀錄
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
