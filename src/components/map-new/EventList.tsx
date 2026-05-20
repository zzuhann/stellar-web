'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { CalendarIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
  return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} - ${fmt(e)}`;
}

const container = css({
  position: 'fixed',
  top: '70px',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '600px',
  mx: 'auto',
  background: 'color.background.primary',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const filterBar = css({
  flexShrink: 0,
  paddingX: '4',
  paddingTop: '3',
  paddingBottom: '2',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const locationChip = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: '9999px',
  background: 'color.background.tertiary',
  border: '1px solid',
  borderColor: 'color.border.light',
  maxWidth: '250px',
  width: 'fit-content',
});

const locationChipText = css({
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const locationChipClose = css({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  color: 'color.text.secondary',
  background: 'none',
  border: 'none',
  padding: '2',
  margin: '-2',
  cursor: 'pointer',
  lineHeight: '1',
});

const cityChipsRow = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '2',
  overflowX: 'auto',
  paddingBottom: '1',
  _scrollbar: { display: 'none' },
});

const cityChipInactive = css({
  flexShrink: 0,
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: '9999px',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'bodySmall',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  background: 'none',
  color: 'color.text.secondary',
});

const cityChipActive = css({
  flexShrink: 0,
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: '9999px',
  border: '1px solid',
  borderColor: 'color.text.primary',
  textStyle: 'bodySmall',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  background: 'color.text.primary',
  color: 'color.background.primary',
});

const listArea = css({
  flex: '1',
  overflowY: 'auto',
  paddingX: '4',
  paddingTop: '3',
  paddingBottom: '3',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const card = css({
  background: 'color.background.secondary',
  borderRadius: 'radius.xl',
  boxShadow: 'shadow.sm',
  padding: '3',
  display: 'flex',
  flexDirection: 'row',
  gap: '3',
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

const backButtonArea = css({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  paddingY: '4',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  background: 'color.background.primary',
});

const backButton = css({
  paddingX: '5',
  paddingY: '2.5',
  borderRadius: '9999px',
  background: 'color.text.primary',
  color: 'color.background.primary',
  textStyle: 'bodyStrong',
  boxShadow: 'shadow.md',
  border: 'none',
  cursor: 'pointer',
});

const calendarIconCss = css({ flexShrink: 0, color: 'color.text.secondary' });
const pinIconCss = css({ flexShrink: 0, color: 'color.text.secondary', marginTop: '1' });

export interface EventListProps {
  events: MapEvent[];
  onBackToMap: () => void;
  isLocationFiltered?: boolean;
  onClearLocationFilter?: () => void;
}

const EventList = ({
  events,
  onBackToMap,
  isLocationFiltered,
  onClearLocationFilter,
}: EventListProps) => {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const cities = [...new Set(events.map((e) => e.location?.city).filter(Boolean))] as string[];

  const activeCity = selectedCity && cities.includes(selectedCity) ? selectedCity : null;

  const filteredEvents = activeCity
    ? events.filter((e) => e.location?.city === activeCity)
    : events;

  const handleCardClick = (event: MapEvent) => {
    const href = event.slug ? `/event/${event.slug}` : `/event/${event.id}`;
    router.push(href);
  };

  const locationName = events[0]?.location?.name ?? events[0]?.location?.city ?? '';
  const showFilterBar = (isLocationFiltered && !!onClearLocationFilter) || cities.length > 1;

  return (
    <div className={container}>
      {showFilterBar && (
        <div className={filterBar}>
          {isLocationFiltered && onClearLocationFilter && (
            <div className={locationChip}>
              <span className={locationChipText}>{locationName}</span>
              <button
                type="button"
                className={locationChipClose}
                aria-label="清除地點篩選"
                onClick={onClearLocationFilter}
              >
                <XMarkIcon width={14} height={14} />
              </button>
            </div>
          )}
          {cities.length > 1 && (
            <div className={cityChipsRow}>
              <button
                type="button"
                className={activeCity === null ? cityChipActive : cityChipInactive}
                onClick={() => setSelectedCity(null)}
              >
                全部
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={activeCity === city ? cityChipActive : cityChipInactive}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={listArea}>
        {filteredEvents.map((event) => {
          const dateRange =
            event.datetime?.start && event.datetime?.end
              ? formatDateRange(event.datetime.start, event.datetime.end)
              : '';

          return (
            <div
              key={event.id}
              className={card}
              onClick={() => handleCardClick(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(event)}
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
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {event.title}
                </p>
                {dateRange && (
                  <div className={dateRow}>
                    <CalendarIcon width={14} height={14} className={calendarIconCss} />
                    <p className={metaText}>{dateRange}</p>
                  </div>
                )}
                {event.location?.name && (
                  <div className={venueRow}>
                    <MapPinIcon width={14} height={14} className={pinIconCss} />
                    <span
                      className={metaText}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {event.location.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={backButtonArea}>
        <button type="button" className={backButton} onClick={onBackToMap}>
          回到地圖
        </button>
      </div>
    </div>
  );
};

export default EventList;
