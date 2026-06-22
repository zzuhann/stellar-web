'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { UsersIcon, StarIcon } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import { trackClickVenueDetail, trackViewVenueCard } from '@/lib/analytics/venues';
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
  paddingTop: '3',
  paddingX: '3',
  paddingBottom: '3',
});

const nameRow = css({
  display: 'flex',
  alignItems: 'flex-start',
});

const venueName = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const locationRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
  marginTop: '2',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const pinIcon = css({
  color: 'color.primary',
  display: 'inline-flex',
  flexShrink: 0,
});

const mrtLabel = css({
  color: 'color.primary',
  fontWeight: 'semibold',
});

const divider = css({
  color: 'gray.300',
});

const statsRow = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '3',
  marginTop: '2.5',
  paddingTop: '2.5',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const statItem = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
});

const eventCount = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
});

const eventCountNum = css({
  color: 'color.primary',
  fontWeight: 'bold',
});

const SCROLL_KEY = 'venues_scrollY';

const hostTagsRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  marginTop: '2.5',
});

const hostTagPill = css({
  paddingY: '0.5',
  paddingX: '2',
  borderRadius: 'radius.sm',
  background: 'transparent',
  border: '1px solid',
  borderColor: 'gray.300',
  textStyle: 'caption',
  color: 'gray.700',
});

const starIconCls = css({ color: 'amber.500' });
const capacityTextCls = css({ color: 'color.text.primary', fontWeight: 'semibold' });

interface VenueCardProps {
  venue: Venue;
  listPosition: number;
  userId?: string;
}

function hasViewedCardInSession(venueId: string): boolean {
  try {
    return sessionStorage.getItem(`venues:viewed_card:${venueId}`) === '1';
  } catch {
    return false;
  }
}

function markViewedCardInSession(venueId: string): void {
  try {
    sessionStorage.setItem(`venues:viewed_card:${venueId}`, '1');
  } catch {
    // ignore storage write failures in private mode
  }
}

export default function VenueCard({ venue, listPosition, userId }: VenueCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const photos = [...(venue.coverPhoto ? [venue.coverPhoto] : []), ...(venue.otherPhotos ?? [])];
  const mrtText = venue.nearestMrt
    ? `${venue.nearestMrt}${venue.mrtWalkMinutes ? ` ${venue.mrtWalkMinutes} 分鐘` : ''}`
    : null;

  useEffect(() => {
    const element = cardRef.current;
    if (!element || hasViewedCardInSession(venue.id)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (!isVisible) return;

        markViewedCardInSession(venue.id);
        trackViewVenueCard({
          userId,
          venueId: venue.id,
          venueRegion: venue.region,
          listPosition,
        });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [listPosition, userId, venue.id, venue.region]);

  const handleClick = () => {
    trackClickVenueDetail({
      userId,
      venueId: venue.id,
      venueRegion: venue.region,
      listPosition,
    });
    sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
  };

  return (
    <Link ref={cardRef} href={`/venues/${venue.id}`} className={card} onClick={handleClick}>
      <VenueCardPhotos photos={photos} venueName={venue.name} />
      <div className={body}>
        <div className={nameRow}>
          <h3 className={venueName}>{venue.name}</h3>
        </div>

        <div className={locationRow}>
          <span className={pinIcon}>
            <svg
              aria-hidden="true"
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
            <>
              <span className={statItem}>
                <UsersIcon aria-hidden="true" width={14} height={14} />
                可容納 <strong className={capacityTextCls}>{venue.capacityRange}</strong> 人
              </span>
              <span className={divider}>·</span>
            </>
          )}
          <span className={eventCount}>
            <StarIcon aria-hidden="true" width={14} height={14} className={starIconCls} />
            <strong className={eventCountNum}>{venue.eventCount}</strong> 場生日應援紀錄
          </span>
        </div>

        {venue.hostTags && venue.hostTags.length > 0 && (
          <div className={hostTagsRow}>
            {venue.hostTags.slice(0, 3).map((t) => (
              <span key={t} className={hostTagPill}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
