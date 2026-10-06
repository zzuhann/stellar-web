'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { UsersIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { trackClickVenueDetail, trackViewVenueCard } from '@/lib/analytics/venues';
import { formatVenueDistance } from '@/utils/formatVenueDistance';
import { haversineDistanceMeters, isMissingVenueCoords, type Coordinates } from '@/utils/geo';
import type { Venue } from '@/types';
import { CAPACITY_RANGE_LABEL } from './venueCapacity';
import { VENUE_CARD_BODY_MIN_HEIGHT } from './venueCardLayout';
import VenueCardPhotos from './VenueCardPhotos';
import MrtIcon from './MrtIcon';

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
  // 與 VenueCardSkeleton 共用同一常數，避免資料量不同的卡片造成 CLS（見 venueCardLayout.ts）
  minHeight: VENUE_CARD_BODY_MIN_HEIGHT,
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
  gap: '2',
  marginTop: '2',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

// 捷運資訊：flex:1 + minWidth:0 讓文字能被壓縮到比內容窄，ellipsis 才生效；過長站名
// 截斷而非換行，避免這排因內容多寡而長高（design-frontend.md「捷運站名過長時的擠壓規則」）。
const mrtInfo = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  flex: '1',
  minWidth: '0',
});

const mrtText = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

// 距離永遠貼右、永遠不縮不換行（這排的主要決策資訊，不能被捷運站名擠到看不清楚）。
// marginLeft:'auto' 而非 justify-content:'space-between'：只剩一個 flex item 時
// space-between 會貼左，auto margin 才能保證距離永遠貼右，不論左側有沒有捷運內容。
const distanceInfo = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  flexShrink: '0',
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
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
  // Currently-effective /venues sort, threaded into the card's GA events (Phase 2.8).
  listSort: string;
  // venue-distance-sort: cached user coords for this browse session (null until
  // resolved, or always null in an in-app browser). Distance display is gated on this
  // being non-null, independent of `listSort` — requirements.md「授權後，距離顯示與
  // 排序選項脫鉤」, once granted it keeps showing across every sort, not just 'distance'.
  userCoords?: Coordinates | null;
  // Defensive, matches design-frontend.md「IAB 環境或該場地缺座標時，不顯示距離文字，
  // 即使已授權」— in real app flow userCoords is never populated inside an IAB (the
  // geolocation request is never triggered there), but the card still guards explicitly
  // rather than relying on that invariant holding elsewhere.
  isInAppBrowser?: boolean;
}

// Keyed by listSort too (not just venueId): switching sort re-exposes a card under a
// different list_sort value, which GA needs to see as a fresh exposure — otherwise
// per-sort CTR denominators undercount whichever sort a venue was first seen under.
function hasViewedCardInSession(venueId: string, listSort: string): boolean {
  try {
    return sessionStorage.getItem(`venues:viewed_card:${listSort}:${venueId}`) === '1';
  } catch {
    return false;
  }
}

function markViewedCardInSession(venueId: string, listSort: string): void {
  try {
    sessionStorage.setItem(`venues:viewed_card:${listSort}:${venueId}`, '1');
  } catch {
    // ignore storage write failures in private mode
  }
}

export default function VenueCard({
  venue,
  listPosition,
  userId,
  listSort,
  userCoords,
  isInAppBrowser,
}: VenueCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const photos = [...(venue.coverPhoto ? [venue.coverPhoto] : []), ...(venue.otherPhotos ?? [])];

  const distanceText =
    !isInAppBrowser && userCoords && !isMissingVenueCoords(venue.lat, venue.lng)
      ? formatVenueDistance(haversineDistanceMeters(userCoords, { lat: venue.lat, lng: venue.lng }))
      : null;

  useEffect(() => {
    const element = cardRef.current;
    if (!element || hasViewedCardInSession(venue.id, listSort)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (!isVisible) return;

        markViewedCardInSession(venue.id, listSort);
        trackViewVenueCard({
          userId,
          venueId: venue.id,
          venueRegion: venue.region,
          listPosition,
          listSort,
        });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [listPosition, listSort, userId, venue.id, venue.region]);

  const handleClick = () => {
    trackClickVenueDetail({
      userId,
      venueId: venue.id,
      venueRegion: venue.region,
      listPosition,
      listSort,
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

        {(venue.nearestMrt || distanceText) && (
          <div className={mrtRow}>
            {venue.nearestMrt && (
              <div className={mrtInfo}>
                <MrtIcon size={14} />
                <span className={mrtText}>
                  {venue.nearestMrt}
                  {venue.mrtWalkMinutes ? ` ${venue.mrtWalkMinutes} 分鐘` : ''}
                </span>
              </div>
            )}
            {distanceText && (
              <span className={distanceInfo}>
                <MapPinIcon aria-hidden="true" width={14} height={14} />
                <span className="sr-only">距離你</span>
                {distanceText}
              </span>
            )}
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

        {(venue.nearestMrt || distanceText || (venue.hostTags && venue.hostTags.length > 0)) && (
          <div className={sectionDivider} data-testid="section-divider" />
        )}

        {(venue.capacityRange || venue.eventCount > 0) && (
          <div className={bottomStats}>
            {venue.capacityRange && (
              <span className={statItem}>
                <UsersIcon aria-hidden="true" width={14} height={14} />
                可容納{' '}
                <strong className={capacityTextCls}>
                  {CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange}
                </strong>{' '}
              </span>
            )}
            {venue.eventCount > 0 && (
              <span className={statItem}>
                <StarIcon aria-hidden="true" width={14} height={14} className={starIconCls} />
                <strong className={eventCountNum}>{venue.eventCount}</strong> 場生日應援紀錄
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
