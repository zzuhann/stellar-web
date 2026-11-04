'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import type { Venue, VenueTagDictionary } from '@/types';
import VenueCardContent, { venueCardLink } from '@/components/venues/VenueCardContent';
import { dateToTaipeiDateString } from '@/utils';
import { getVenueCardTags, toCardTagsParam } from '@/utils/venueTags';
import { trackClickHomeVenueDetail, trackViewHomeVenueCard } from '@/lib/analytics/venues';

const card = css({ scrollSnapAlign: 'start' });

interface HomeVenueCardProps {
  venue: Venue;
  listPosition: number;
  // null = dictionary failed: no tag row, card_tags 'dict_error'
  dictionary: VenueTagDictionary | null;
}

const HomeVenueCard = ({ venue, listPosition, dictionary }: HomeVenueCardProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const tags = getVenueCardTags(venue.tags, dictionary, dateToTaipeiDateString(new Date()));
  const cardTags = toCardTagsParam(tags, dictionary);

  useEffect(() => {
    const element = cardRef.current;
    const storageKey = `venues:viewed_card:homepage_random:${venue.id}`;
    if (!element || sessionStorage.getItem(storageKey) === '1') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        sessionStorage.setItem(storageKey, '1');
        trackViewHomeVenueCard({
          venueId: venue.id,
          venueRegion: venue.region,
          listPosition,
          cardTags,
        });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [cardTags, listPosition, venue.id, venue.region]);

  const handleClick = () => {
    trackClickHomeVenueDetail({
      venueId: venue.id,
      venueRegion: venue.region,
      listPosition,
      cardTags,
    });
  };

  return (
    <Link
      ref={cardRef}
      href={`/venues/${venue.id}`}
      className={`${venueCardLink} ${card}`}
      onClick={handleClick}
    >
      <VenueCardContent venue={venue} tags={tags} variant="home" />
    </Link>
  );
};

export default HomeVenueCard;
