'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackClickVenueDetail, trackViewVenueCard } from '@/lib/analytics/venues';
import { formatVenueDistance } from '@/utils/formatVenueDistance';
import { haversineDistanceMeters, isMissingVenueCoords, type Coordinates } from '@/utils/geo';
import { dateToTaipeiDateString } from '@/utils';
import { getVenueCardTags, toCardTagsParam } from '@/utils/venueTags';
import type { Venue, VenueTagDictionary } from '@/types';
import VenueCardContent, { venueCardLink } from './VenueCardContent';

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
  // null = dictionary failed: no tag row, card_tags 'dict_error'. The parent renders
  // cards only once the dictionary query has settled (venue-list-redesign)
  dictionary: VenueTagDictionary | null;
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
  dictionary,
}: VenueCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const tags = getVenueCardTags(venue.tags, dictionary, dateToTaipeiDateString(new Date()));
  const cardTags = toCardTagsParam(tags, dictionary);

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
          cardTags,
        });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [cardTags, listPosition, listSort, userId, venue.id, venue.region]);

  const handleClick = () => {
    trackClickVenueDetail({
      userId,
      venueId: venue.id,
      venueRegion: venue.region,
      listPosition,
      listSort,
      cardTags,
    });
    sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
  };

  return (
    <Link
      ref={cardRef}
      href={`/venues/${venue.id}`}
      className={venueCardLink}
      onClick={handleClick}
    >
      <VenueCardContent venue={venue} tags={tags} distanceText={distanceText} variant="list" />
    </Link>
  );
}
