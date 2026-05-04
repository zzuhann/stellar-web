'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapEvent } from '@/types';
import { formatDateRange } from '@/utils';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { css } from '@/styled-system/css';

const container = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '4',
  padding: '4',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: 'shadow.sm',
});

const loadingOverlay = css({
  position: 'absolute',
  inset: 0,
  borderRadius: 'radius.lg',
  backgroundColor: 'rgba(255,255,255,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
});

const spinner = css({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: '2px solid rgba(0,0,0,0.15)',
  borderTopColor: 'rgba(0,0,0,0.6)',
  animation: 'spin 0.7s linear infinite',
});

const infoContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const title = css({
  textStyle: 'bodyStrong',
  fontWeight: 'bold',
  color: 'color.text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  lineClamp: 1,
});

const descriptionContainer = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  '@media (max-width: 400px)': {
    fontSize: 'xs',
  },
});

const description = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  lineClamp: 2,
});

const imageContainer = css({
  width: '100px',
  height: '100px',
  minWidth: '100px',
  minHeight: '100px',
  borderRadius: 'radius.lg',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '@media (max-width: 400px)': {
    width: '80px',
    height: '80px',
    minWidth: '80px',
    minHeight: '80px',
  },
});

type EventCardProps = {
  event: MapEvent;
};

const EventCard = ({ event }: EventCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(`/event/${event.id}`);
    });
  };

  return (
    <Link href={`/event/${event.id}`} onClick={handleClick}>
      <div className={container}>
        <div className={infoContainer}>
          <div className={title}>{event.title}</div>
          <div className={descriptionContainer}>
            <CalendarIcon
              aria-hidden="true"
              style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}
            />
            <div className={description}>
              {formatDateRange(event.datetime.start, event.datetime.end)}
            </div>
          </div>
          <div className={descriptionContainer}>
            <MapPinIcon
              aria-hidden="true"
              style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}
            />
            <div className={description}>
              {event.location.name} ({event.location.address})
            </div>
          </div>
        </div>
        <div
          className={imageContainer}
          style={{
            backgroundImage: event.mainImage ? `url(${event.mainImage})` : undefined,
          }}
        />
        {isPending && (
          <div className={loadingOverlay}>
            <div className={spinner} />
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
