'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { UsersIcon, StarIcon } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import { trackClickVenueDetail, trackViewVenueCard } from '@/lib/analytics/venues';
import type { Venue } from '@/types';
import { CAPACITY_RANGE_LABEL } from './venueCapacity';
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
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '2',
});

const venueName = css({
  margin: 0,
  textStyle: 'bodySmall',
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

const mrtRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  marginTop: '2',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const mrtLabel = css({
  color: 'color.primary',
  fontWeight: 'semibold',
});

const hostTagsRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  marginTop: '2',
});

const hostTagPill = css({
  paddingY: '1',
  paddingX: '2',
  borderRadius: '9999px',
  background: 'gray.100',
  textStyle: 'caption',
  color: 'gray.700',
});

const sectionDivider = css({
  borderTop: '1px dashed',
  borderColor: 'gray.200',
  marginY: '2',
});

const bottomStats = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const statItem = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
});

const capacityTextCls = css({ color: 'color.text.primary', fontWeight: 'semibold' });

const eventCountNum = css({
  color: 'color.primary',
  fontWeight: 'bold',
});

const starIconCls = css({ color: 'amber.500' });

const SCROLL_KEY = 'venues_scrollY';

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
          <h3 className={venueName} style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {venue.name}
          </h3>
          <span className={regionBadge}>{venue.region}</span>
        </div>

        {venue.nearestMrt && (
          <div className={mrtRow}>
            <span className={mrtLabel}>M</span>
            <span>
              {venue.nearestMrt}
              {venue.mrtWalkMinutes ? ` ${venue.mrtWalkMinutes} 分鐘` : ''}
            </span>
          </div>
        )}

        {venue.hostTags && venue.hostTags.length > 0 && (
          <div className={hostTagsRow}>
            {venue.hostTags.slice(0, 3).map((t) => (
              <span key={t} className={hostTagPill}>
                {t}
              </span>
            ))}
          </div>
        )}

        {(venue.nearestMrt || (venue.hostTags && venue.hostTags.length > 0)) && (
          <div className={sectionDivider} />
        )}

        <div className={bottomStats}>
          <span className={statItem}>
            <UsersIcon aria-hidden="true" width={14} height={14} />
            可容納{' '}
            <strong className={capacityTextCls}>
              {CAPACITY_RANGE_LABEL[venue.capacityRange ?? ''] ?? venue.capacityRange}
            </strong>{' '}
          </span>
          <span className={statItem}>
            <StarIcon aria-hidden="true" width={14} height={14} className={starIconCls} />
            <strong className={eventCountNum}>{venue.eventCount}</strong> 場生日應援紀錄
          </span>
        </div>
      </div>
    </Link>
  );
}
