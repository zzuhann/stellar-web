'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { CalendarIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
  return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} - ${fmt(e)}`;
}

const wrapper = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '600px',
  mx: 'auto',
  paddingX: '4',
  paddingBottom: '6',
  zIndex: '10',
});

const card = css({
  background: 'color.background.secondary',
  borderRadius: 'radius.xl',
  boxShadow: 'shadow.lg',
  padding: '3',
  display: 'flex',
  flexDirection: 'row',
  gap: '3',
  position: 'relative',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.border.light',
});

const imageArea = css({
  aspectRatio: '3 / 4',
  width: '100px',
  height: 'auto',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative',
  background: 'color.background.tertiary',
});

const imageCss = css({
  objectFit: 'cover',
});

const placeholderBg = css({
  position: 'absolute',
  inset: '0',
  background: 'linear-gradient(135deg, {colors.stellarBlue.500} 0%, {colors.stellarBlue.200} 100%)',
});

const infoArea = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  overflow: 'hidden',
  paddingRight: '6',
  paddingTop: '1',
});

const cityText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  lineHeight: '1',
  borderRadius: '9999px',
  boxShadow: 'shadow.sm',
  paddingX: '3',
  paddingY: '2',
  background: 'color.background.secondary',
  display: 'inline-block',
  marginBottom: '0.5',
  width: 'fit-content',
});

const titleText = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  lineHeight: '1.3',
  overflow: 'hidden',
  marginTop: '0.5',
});

const dateRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  marginTop: '0.5',
});

const venueRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1',
  marginTop: '0.5',
});

const metaText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  overflow: 'hidden',
});

const closeButton = css({
  position: 'absolute',
  top: '2',
  right: '2',
  width: '44px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'color.text.secondary',
  borderRadius: 'radius.sm',
  _hover: {
    color: 'color.text.primary',
    background: 'color.background.hover',
  },
});

export interface MapSingleEventCardProps {
  event: MapEvent;
  artistId: string;
  onDismiss: () => void;
}

const MapSingleEventCard = ({ event, artistId, onDismiss }: MapSingleEventCardProps) => {
  const router = useRouter();
  const { user } = useAuth();

  const dateRange =
    event.datetime?.start && event.datetime?.end
      ? formatDateRange(event.datetime.start, event.datetime.end)
      : '';

  const handleCardClick = () => {
    sendGAEvent('event', 'click_event_detail', {
      event_page: '/map-new/[artistId]',
      user_id: user?.uid ?? '',
      content_id: event.id,
      artist_id: artistId,
      source: 'map_single_card',
    });
    const href = event.slug ? `/event/${event.slug}` : `/event/${event.id}`;
    router.push(href);
  };

  return (
    <div className={wrapper}>
      <div
        className={card}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      >
        <div className={imageArea}>
          {event.mainImage ? (
            <Image
              src={event.mainImage}
              alt={event.title}
              fill
              sizes="100px"
              className={imageCss}
            />
          ) : (
            <div className={placeholderBg} />
          )}
        </div>

        <div className={infoArea}>
          {event.location?.city && <span className={cityText}>{event.location.city}</span>}
          <p
            className={titleText}
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {event.title}
          </p>
          {dateRange && (
            <div className={dateRow}>
              <CalendarIcon
                width={14}
                height={14}
                className={css({ flexShrink: 0, color: 'color.text.secondary' })}
              />
              <p
                className={metaText}
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              >
                {dateRange}
              </p>
            </div>
          )}
          {event.location?.name && (
            <div className={venueRow}>
              <MapPinIcon
                width={14}
                height={14}
                className={css({ flexShrink: 0, color: 'color.text.secondary', marginTop: '1' })}
              />
              <span
                className={metaText}
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              >
                {event.location.name}
              </span>
            </div>
          )}
        </div>

        <button
          className={closeButton}
          type="button"
          aria-label="關閉"
          onClick={(e) => {
            e.stopPropagation();
            sendGAEvent('event', 'map_single_card_close', {
              event_page: '/map-new/[artistId]',
              user_id: user?.uid ?? '',
              content_id: event.id,
              artist_id: artistId,
            });
            onDismiss();
          }}
        >
          <XMarkIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
};

export default MapSingleEventCard;
