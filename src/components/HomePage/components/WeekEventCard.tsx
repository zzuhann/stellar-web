'use client';

import Image from 'next/image';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import { CoffeeEvent, FirebaseTimestamp } from '@/types';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatEventDateShort } from '@/utils';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

const cardContainer = css({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
  textDecoration: 'none',
  color: 'inherit',
  padding: '1',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: 'shadow.md',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const imageArea = css({
  position: 'relative',
  aspectRatio: '3 / 4',
  width: '100%',
  background: 'color.background.secondary',
  borderRadius: 'radius.md',
  overflow: 'hidden',
  flexShrink: 0,
});

const infoArea = css({
  paddingX: '1',
  paddingTop: '2',
  paddingBottom: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const titleText = css({
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  lineHeight: '1.3',
  overflow: 'hidden',
  marginBottom: '1',
  lineClamp: 2,
});

const metaRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

const metaText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  lineHeight: '1.4',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const iconStyle = css({
  flexShrink: 0,
  color: 'color.text.secondary',
});

const imagePlaceholder = css({
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, {colors.stellarBlue.50} 0%, {colors.stellarBlue.500} 100%)',
});

const cityBadge = css({
  position: 'absolute',
  top: '2',
  left: '2',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'caption',
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: '9999px',
  // lineHeight: '1.4',
  zIndex: '1',
  boxShadow: 'shadow.md',
});

interface WeekEventCardProps {
  event: CoffeeEvent;
  isFirst?: boolean;
}

export default function WeekEventCard({ event, isFirst }: WeekEventCardProps) {
  const { user } = useAuth();
  const dateRange = formatEventDateShort(
    event.datetime.start as FirebaseTimestamp,
    event.datetime.end as FirebaseTimestamp
  );
  const href = `/event/${event.slug ?? event.id}`;

  const handleClick = () => {
    sendGAEvent('event', 'click_event_card', {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: event.id,
    });
  };

  return (
    <Link
      href={href}
      prefetch={false}
      className={cardContainer}
      aria-label={`前往 ${event.title} 活動詳情`}
      onClick={handleClick}
    >
      <div className={imageArea}>
        {event.mainImage ? (
          <Image
            src={event.mainImage}
            alt={event.title}
            fill
            sizes="(max-width: 600px) 45vw, 200px"
            style={{ objectFit: 'cover' }}
            priority={isFirst}
          />
        ) : (
          <div className={imagePlaceholder} />
        )}
        {event.location?.city && <span className={cityBadge}>{event.location.city}</span>}
      </div>

      <div className={infoArea}>
        <p className={titleText}>{event.title}</p>
        <div className={metaRow}>
          <CalendarIcon width={14} height={14} className={iconStyle} aria-hidden="true" />
          <span className={metaText}>{dateRange}</span>
        </div>
        {event.location?.name && (
          <div className={metaRow}>
            <MapPinIcon width={14} height={14} className={iconStyle} aria-hidden="true" />
            <span className={metaText}>{event.location.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
