'use client';

import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
  return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} - ${fmt(e)}`;
}

const cardContainer = css({
  display: 'flex',
  flexDirection: 'column',
  width: '230px',
  flexShrink: 0,
  scrollSnapAlign: 'start',
  cursor: 'pointer',
  borderRadius: 'radius.xl',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
  padding: '2',
  textDecoration: 'none',
  color: 'inherit',
});

const imageArea = css({
  position: 'relative',
  aspectRatio: '3 / 4',
  width: '100%',
  flexShrink: 0,
  background: 'color.background.secondary',
});

const image = css({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'radius.lg',
});

const placeholderBg = css({
  position: 'absolute',
  inset: '0',
  background: 'linear-gradient(135deg, {colors.stellarBlue.500} 0%, {colors.stellarBlue.200} 100%)',
});

const cityBadge = css({
  position: 'absolute',
  top: '2',
  left: '2',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: '9999px',
  lineHeight: '1.4',
  zIndex: '1',
  boxShadow: 'shadow.md',
});

const infoArea = css({
  padding: '2',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
});

const dateRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5',
});

const dateText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  lineHeight: '1.4',
});

const titleText = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  lineHeight: '1.3',
  overflow: 'hidden',
  marginBottom: '1.5',
});

const venueRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5',
  overflow: 'hidden',
});

const venueText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  overflow: 'hidden',
  whiteSpace: 'normal',
});

export interface EventCarouselCardProps {
  event: MapEvent;
  artistId: string;
}

const EventCarouselCard = ({ event, artistId }: EventCarouselCardProps) => {
  const { user } = useAuth();
  const dateRange =
    event.datetime?.start && event.datetime?.end
      ? formatDateRange(event.datetime.start, event.datetime.end)
      : '';

  const eventSlug = event.slug || event.id;
  const href = eventSlug ? `/event/${eventSlug}` : '#';

  const handleCardClick = () => {
    sendGAEvent('event', 'click_event_detail', {
      event_page: '/map-new/[artistId]',
      user_id: user?.uid ?? '',
      content_id: event.id,
      artist_id: artistId,
      source: 'carousel',
    });
  };

  return (
    <Link
      href={href}
      className={cardContainer}
      aria-label={`前往 ${event.title} 活動詳情`}
      onClick={handleCardClick}
    >
      {/* Image area */}
      <div className={imageArea}>
        {event.mainImage ? (
          <Image src={event.mainImage} alt={event.title} fill sizes="160px" className={image} />
        ) : (
          <div className={placeholderBg} />
        )}
        {event.location?.city && <span className={cityBadge}>{event.location.city}</span>}
      </div>

      {/* Info area */}
      <div className={infoArea}>
        <p
          className={titleText}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {event.title}
        </p>
        {dateRange && (
          <div className={dateRow}>
            <CalendarIcon
              width={16}
              height={16}
              className={css({ flexShrink: 0, color: 'color.text.secondary' })}
            />{' '}
            <p className={dateText}>{dateRange}</p>
          </div>
        )}
        {event.location?.name && (
          <div className={venueRow}>
            <MapPinIcon
              width={16}
              height={16}
              className={css({ flexShrink: 0, color: 'color.text.secondary', marginTop: '1' })}
            />
            <span
              className={venueText}
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
            >
              {event.location.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCarouselCard;
