import { MapEvent } from '@/types';
import { formatDateRange } from '@/utils';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { css } from '@/styled-system/css';

const container = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '16px',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: 'shadow.sm',
});

const infoContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const title = css({
  fontSize: '16px',
  fontWeight: '900',
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
  gap: '8px',
  fontSize: '14px',
  color: 'color.text.secondary',
  '@media (max-width: 400px)': {
    fontSize: '12px',
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
  return (
    <Link href={`/event/${event.id}`}>
      <div className={container} key={event.id}>
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
      </div>
    </Link>
  );
};

export default EventCard;
