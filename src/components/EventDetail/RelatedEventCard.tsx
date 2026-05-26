'use client';

import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const fmt = (d: Date) => `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} - ${fmt(e)}`;
}

const cardContainer = css({
  display: 'flex',
  flexDirection: 'column',
  width: '200px',
  flexShrink: 0,
  scrollSnapAlign: 'start',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  padding: '2',
  backgroundColor: 'color.background.primary',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  boxShadow: 'shadow.sm',
});

const imageArea = css({
  position: 'relative',
  aspectRatio: '3 / 4',
  width: '100%',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  flexShrink: 0,
});

const placeholderBg = css({
  position: 'absolute',
  inset: '0',
  background: 'linear-gradient(135deg, {colors.stellarBlue.500} 0%, {colors.stellarBlue.200} 100%)',
});

const infoArea = css({
  paddingTop: '2',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
});

const titleText = css({
  textStyle: 'bodyStrong',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  lineHeight: '1.3',
  overflow: 'hidden',
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

const metaRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5',
});

const metaText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const metaIcon = css({
  flexShrink: 0,
  color: 'color.text.secondary',
});

interface RelatedEventCardProps {
  event: MapEvent;
  eventPage: string;
  contentId: string;
}

const RelatedEventCard = ({ event, eventPage, contentId }: RelatedEventCardProps) => {
  const { user } = useAuth();

  const dateRange =
    event.datetime?.start && event.datetime?.end
      ? formatDateRange(event.datetime.start, event.datetime.end)
      : '';

  const handleClick = () => {
    sendGAEvent('event', 'click_related_event', {
      event_page: eventPage,
      user_id: user?.uid ?? '',
      content_id: contentId,
    });
  };

  return (
    <Link
      href={`/event/${event.slug || event.id}`}
      className={cardContainer}
      prefetch={false}
      aria-label={`前往 ${event.title} 活動詳情`}
      onClick={handleClick}
    >
      {/* Image area */}
      <div className={imageArea}>
        {event.mainImage ? (
          <Image
            src={event.mainImage}
            alt={event.title}
            fill
            sizes="200px"
            style={{ objectFit: 'cover' }}
          />
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
          <div className={metaRow}>
            <CalendarIcon width={14} height={14} className={metaIcon} />
            <p className={metaText}>{dateRange}</p>
          </div>
        )}
        {event.location?.name && (
          <div className={metaRow}>
            <MapPinIcon width={14} height={14} className={metaIcon} />
            <p className={metaText}>{event.location.name}</p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RelatedEventCard;
