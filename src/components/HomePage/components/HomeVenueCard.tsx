'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, UsersIcon } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import type { Venue } from '@/types';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';
import { trackClickHomeVenueDetail, trackViewHomeVenueCard } from '@/lib/analytics/venues';

const card = css({
  display: 'block',
  height: '100%',
  overflow: 'hidden',
  color: 'color.text.primary',
  textDecoration: 'none',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.sm',
  scrollSnapAlign: 'start',
  transition: 'box-shadow 0.2s ease',
  _hover: { boxShadow: 'shadow.md' },
  _focusVisible: { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '2px' },
});

const photo = css({
  position: 'relative',
  height: '160px',
  overflow: 'hidden',
  background: 'gray.100',
});

const placeholder = css({
  height: '160px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'gray.500',
  background:
    'repeating-linear-gradient(135deg, var(--colors-gray-100) 0 12px, var(--colors-gray-50) 12px 24px)',
});

const body = css({ paddingTop: '3', paddingX: '3', paddingBottom: '3' });
const nameRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '2',
});
const venueName = css({
  margin: 0,
  overflow: 'hidden',
  display: '-webkit-box',
  lineClamp: 2,
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  color: 'color.text.primary',
});
const regionBadge = css({
  flexShrink: 0,
  paddingX: '2',
  paddingY: '1',
  borderRadius: '9999px',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  textStyle: 'caption',
  whiteSpace: 'nowrap',
});
const sectionDivider = css({
  marginY: '2',
  borderTop: '1px dashed',
  borderColor: 'gray.200',
});
const bottomStats = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
});
const statItem = css({ display: 'inline-flex', alignItems: 'center', gap: '1' });
const capacityText = css({ color: 'color.text.primary', fontWeight: 'semibold' });
const eventCount = css({ color: 'color.primary', fontWeight: 'bold' });
const starIcon = css({ color: 'amber.500' });

interface HomeVenueCardProps {
  venue: Venue;
  listPosition: number;
}

const HomeVenueCard = ({ venue, listPosition }: HomeVenueCardProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);

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
        });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [listPosition, venue.id, venue.region]);

  const handleClick = () => {
    trackClickHomeVenueDetail({
      venueId: venue.id,
      venueRegion: venue.region,
      listPosition,
    });
  };

  return (
    <Link
      ref={cardRef}
      href={`/venues/${venue.id}`}
      className={card}
      aria-label={`${venue.name}，查看場地詳情`}
      onClick={handleClick}
    >
      {venue.coverPhoto ? (
        <div className={photo}>
          <Image
            src={venue.coverPhoto}
            alt={`${venue.name}場地照片`}
            fill
            sizes="(min-width: 768px) 260px, 78vw"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>
      ) : (
        <div className={placeholder}>店家尚未提供場地照片</div>
      )}
      <div className={body}>
        <div className={nameRow}>
          <h3 className={venueName} style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {venue.name}
          </h3>
          <span className={regionBadge}>{venue.region}</span>
        </div>

        <div className={sectionDivider} />

        <div className={bottomStats}>
          <span className={statItem}>
            <UsersIcon aria-hidden="true" width={14} height={14} />
            可容納{' '}
            <strong className={capacityText}>
              {CAPACITY_RANGE_LABEL[venue.capacityRange ?? ''] ?? venue.capacityRange}
            </strong>
          </span>
          <span className={statItem}>
            <StarIcon aria-hidden="true" width={14} height={14} className={starIcon} />
            <strong className={eventCount}>{venue.eventCount}</strong> 場生日應援紀錄
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HomeVenueCard;
