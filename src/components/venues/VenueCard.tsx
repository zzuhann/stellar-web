import Link from 'next/link';
import { css } from '@/styled-system/css';
import type { Venue } from '@/types';
import VenueCardPhotos from './VenueCardPhotos';

const card = css({
  display: 'block',
  textDecoration: 'none',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  boxShadow: 'shadow.sm',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: 'shadow.md',
  },
});

const body = css({
  padding: '12px 14px 14px',
});

const nameRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '10px',
});

const venueName = css({
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: 'color.text.primary',
  lineHeight: 1.35,
});

const tag = css({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: 'radius.sm',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: 'nowrap',
});

const locationRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '8px',
  fontSize: '12px',
  color: 'color.text.secondary',
});

const pinIcon = css({
  color: 'color.primary',
  display: 'inline-flex',
  flexShrink: 0,
});

const mrtLabel = css({
  color: 'color.primary',
  fontWeight: 600,
});

const divider = css({
  color: 'gray.300',
});

const statsRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px dashed',
  borderTopColor: 'color.border.light',
  fontSize: '12px',
  color: 'color.text.secondary',
});

const statItem = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

const eventCount = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  marginLeft: 'auto',
});

const eventCountNum = css({
  color: 'color.primary',
  fontWeight: 700,
});

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const photos = venue.coverPhoto ? [venue.coverPhoto] : [];
  const mrtText = venue.nearestMrt
    ? `${venue.nearestMrt}${venue.mrtWalkMinutes ? ` ${venue.mrtWalkMinutes} 分鐘` : ''}`
    : null;

  return (
    <Link href={`/venues/${venue.id}`} className={card}>
      <VenueCardPhotos photos={photos} venueName={venue.name} />
      <div className={body}>
        <div className={nameRow}>
          <h3 className={venueName}>{venue.name}</h3>
          <span className={tag}>{venue.region}</span>
        </div>

        <div className={locationRow}>
          <span className={pinIcon}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span>{venue.region}</span>
          {mrtText && (
            <>
              <span className={divider}>·</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span className={mrtLabel}>M</span> {mrtText}
              </span>
            </>
          )}
        </div>

        <div className={statsRow}>
          {venue.capacityRange && (
            <span className={statItem}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <circle cx="17" cy="9" r="2.4" />
                <path d="M16 20c0-2.6 1.5-4.5 4-4.5" />
              </svg>
              可容納{' '}
              <strong style={{ color: 'var(--colors-gray-700)', fontWeight: 600 }}>
                {venue.capacityRange}
              </strong>{' '}
              人
            </span>
          )}
          <span className={eventCount}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: 'var(--colors-amber-500)' }}
            >
              <path d="M12 3 14.5 9 21 10l-5 4.5 1.5 6.5L12 17.5 6.5 21 8 14.5 3 10l6.5-1z" />
            </svg>
            辦過 <strong className={eventCountNum}>{venue.eventCount}</strong> 場
          </span>
        </div>
      </div>
    </Link>
  );
}
