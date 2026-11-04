'use client';

import { useState } from 'react';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import { VENUE_HOME_CARD_COVER_HEIGHT, venueCardListRatio } from './venueCardLayout';

const cover = css({
  position: 'relative',
  overflow: 'hidden',
  background: 'gray.100',
});

const placeholder = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  color: 'gray.500',
  textStyle: 'caption',
  background:
    'repeating-linear-gradient(135deg, var(--colors-gray-100) 0 12px, var(--colors-gray-50) 12px 24px)',
});

const badge = css({
  position: 'absolute',
  right: '2',
  bottom: '2',
  paddingX: '2',
  borderRadius: 'radius.sm',
  background: 'alpha.black.60',
  color: 'gray.0',
  textStyle: 'caption',
  fontVariantNumeric: 'tabular-nums',
});

interface VenueCardCoverProps {
  src: string | null;
  photoCount: number;
  venueName: string;
  variant: 'list' | 'home';
}

// Remount (key) per src from the parent so a failed image does not stick to the next venue
export default function VenueCardCoverClient({
  src,
  photoCount,
  venueName,
  variant,
}: VenueCardCoverProps) {
  const [failed, setFailed] = useState(false);
  const sizeStyle = variant === 'home' ? { height: VENUE_HOME_CARD_COVER_HEIGHT } : undefined;
  const ratioClass = variant === 'home' ? '' : venueCardListRatio;

  if (!src) {
    return (
      <div className={`${cover} ${placeholder} ${ratioClass}`} style={sizeStyle}>
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
          <circle cx="12" cy="13" r="3.5" />
          <path d="M3 3l18 18" />
        </svg>
        <span>店家尚未提供場地照片</span>
      </div>
    );
  }

  return (
    <div className={`${cover} ${ratioClass}`} style={sizeStyle}>
      {!failed && (
        <Image
          src={src}
          alt={`${venueName} 場地照片`}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
          sizes={
            variant === 'home'
              ? '(min-width: 768px) 260px, 78vw'
              : '(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw'
          }
          onError={() => setFailed(true)}
        />
      )}
      {photoCount >= 2 && <span className={badge}>{photoCount} 張照片</span>}
    </div>
  );
}
