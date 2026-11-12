'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { formatEventDateShort } from '@/utils';

const card = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  minWidth: '0',
  textDecoration: 'none',
  color: 'inherit',
});

const poster = css({
  position: 'relative',
  aspectRatio: '3 / 4',
  width: '100%',
  borderRadius: 'radius.md',
  overflow: 'hidden',
  background: 'color.background.secondary',
});

const posterImage = css({
  objectFit: 'cover',
});

const textArea = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
  minWidth: '0',
});

const title = css({
  textStyle: 'caption',
  fontSize: '13px',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const venue = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

// Wraps instead of truncating: the end date decides whether people go
const date = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  fontVariantNumeric: 'tabular-nums',
});

interface OverviewEventCardProps {
  event: MapEvent;
  artistId: string;
  priority?: boolean;
}

export default function OverviewEventCard({ event, artistId, priority }: OverviewEventCardProps) {
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  // Backend returns slug: null for some events, so `??` would not be enough
  const href = `/event/${event.slug || event.id}`;
  const dateText =
    event.datetime?.start && event.datetime?.end
      ? formatEventDateShort(event.datetime.start, event.datetime.end)
      : '';

  const handleClick = () => {
    sendGAEvent('event', 'click_event_detail', {
      event_page: '/map/[artistId]/overview',
      user_id: user?.uid ?? '',
      content_id: event.id,
      artist_id: artistId,
      ui_source: 'overview_grid',
    });
  };

  return (
    <Link href={href} prefetch={false} className={card} onClick={handleClick}>
      <div className={poster}>
        {event.mainImage && !imageFailed && (
          <Image
            src={event.mainImage}
            alt={event.title}
            fill
            sizes="(min-width: 600px) 192px, 30vw"
            className={posterImage}
            priority={priority}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className={textArea}>
        <p className={title}>{event.title}</p>
        {event.location?.name && <p className={venue}>{event.location.name}</p>}
        {dateText && <p className={date}>{dateText}</p>}
      </div>
    </Link>
  );
}
