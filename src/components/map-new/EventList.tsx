'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  CalendarIcon,
  CalendarDaysIcon,
  FunnelIcon,
  MapPinIcon,
  XMarkIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import Skeleton from '@/components/ui/Skeleton';

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
  paddingBottom: '80px',
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
  textDecoration: 'none',
  color: 'inherit',
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
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '600px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
  paddingY: '4',
  paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  background: 'color.background.primary',
  zIndex: '20',
});

const backButton = css({
  paddingX: '5',
  paddingY: '2.5',
  borderRadius: '9999px',
  background: 'color.text.primary',
  color: 'color.background.primary',
  textStyle: 'bodySmall',
  boxShadow: 'shadow.md',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
});

const calendarIconCss = css({ flexShrink: 0, color: 'color.text.secondary' });
const pinIconCss = css({ flexShrink: 0, color: 'color.text.secondary', marginTop: '1' });

const emptyState = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3',
  flex: '1',
  justifyContent: 'center',
});

const emptyStateIcon = css({
  color: 'color.text.disabled',
});

const emptyStateTitle = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const emptyStateDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  textAlign: 'center',
});

const emptyStateClearButton = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'color.text.link',
  textStyle: 'bodySmall',
  paddingX: '4',
  paddingY: '3',
  minWidth: '44px',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const skeletonCard = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '3',
  padding: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.xl',
});

export interface EventListProps {
  artistId: string;
  events: MapEvent[];
  onBackToMap: () => void;
  isLocationFiltered?: boolean;
  onClearLocationFilter?: () => void;
  isLoading?: boolean;
}

const EventList = ({
  artistId,
  events,
  onBackToMap,
  isLocationFiltered,
  onClearLocationFilter,
  isLoading,
}: EventListProps) => {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const cities = [...new Set(events.map((e) => e.location?.city).filter(Boolean))] as string[];

  const activeCity = selectedCity && cities.includes(selectedCity) ? selectedCity : null;

  const filteredEvents = activeCity
    ? events.filter((e) => e.location?.city === activeCity)
    : events;

  const locationName = events[0]?.location?.name ?? events[0]?.location?.city ?? '';
  const showFilterBar = (isLocationFiltered && !!onClearLocationFilter) || cities.length > 1;

  const handleBackToMap = () => {
    sendGAEvent('event', 'map_list_mode_exit', {
      event_page: '/map-new/[artistId]',
      user_id: user?.uid ?? '',
      content_id: artistId,
    });
    onBackToMap();
  };

  if (isLoading) {
    return (
      <div className={container}>
        <div className={listArea}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={skeletonCard}>
              <Skeleton
                width="100px"
                height="auto"
                style={{ aspectRatio: '3/4', flexShrink: 0 }}
                borderRadius="8px"
              />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingTop: '4px',
                }}
              >
                <Skeleton width="50%" height="12px" borderRadius="9999px" />
                <Skeleton width="90%" height="16px" borderRadius="4px" />
                <Skeleton width="75%" height="16px" borderRadius="4px" />
                <Skeleton width="60%" height="12px" borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
        <div className={backButtonArea}>
          <button type="button" className={backButton} onClick={handleBackToMap}>
            <MapIcon width={14} height={14} color="color.text.primary" />
            地圖
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={container}>
        <div className={listArea}>
          <div className={emptyState}>
            <CalendarDaysIcon width={32} height={32} className={emptyStateIcon} />
            <p className={emptyStateTitle}>目前沒有生日應援活動</p>
            <p className={emptyStateDesc}>
              這位藝人目前還沒有生日應援，{'\n'}等活動上架後再來看看吧！
            </p>
          </div>
        </div>
        <div className={backButtonArea}>
          <button type="button" className={backButton} onClick={handleBackToMap}>
            <MapIcon width={14} height={14} color="color.text.primary" />
            地圖
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      {showFilterBar && (
        <div className={filterBar}>
          {isLocationFiltered && onClearLocationFilter && (
            <div className={locationChip}>
              <span className={locationChipText} title={locationName}>
                {locationName}
              </span>
              <button
                type="button"
                className={locationChipClose}
                aria-label="清除地點篩選"
                onClick={() => {
                  sendGAEvent('event', 'map_location_filter_clear', {
                    event_page: '/map-new/[artistId]',
                    user_id: user?.uid ?? '',
                    content_id: artistId,
                  });
                  onClearLocationFilter();
                }}
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
                  onClick={() => {
                    sendGAEvent('event', 'map_city_filter_select', {
                      event_page: '/map-new/[artistId]',
                      user_id: user?.uid ?? '',
                      content_id: artistId,
                      city,
                    });
                    setSelectedCity(city);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={listArea}>
        {filteredEvents.length === 0 && activeCity !== null ? (
          <div className={emptyState} role="status">
            <FunnelIcon width={32} height={32} className={emptyStateIcon} />
            <p className={emptyStateTitle}>這個地區目前沒有生日應援活動</p>
            <p className={emptyStateDesc}>試試看其他地區，或清除篩選查看全部活動</p>
            <button
              type="button"
              className={emptyStateClearButton}
              onClick={() => setSelectedCity(null)}
            >
              清除地區篩選
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const dateRange =
              event.datetime?.start && event.datetime?.end
                ? formatDateRange(event.datetime.start, event.datetime.end)
                : '';
            const eventSlug = event.slug || event.id;
            const href = eventSlug ? `/event/${eventSlug}` : '#';

            return (
              <Link
                key={event.id}
                href={href}
                className={card}
                data-testid="event-card"
                aria-label={`前往 ${event.title} 活動詳情`}
                onClick={() => {
                  sendGAEvent('event', 'click_event_detail', {
                    event_page: '/map-new/[artistId]',
                    user_id: user?.uid ?? '',
                    content_id: event.id,
                    artist_id: artistId,
                    source: 'list_mode',
                  });
                }}
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
              </Link>
            );
          })
        )}
      </div>

      <div className={backButtonArea}>
        <button type="button" className={backButton} onClick={handleBackToMap}>
          <MapIcon width={14} height={14} color="color.text.primary" />
          地圖
        </button>
      </div>
    </div>
  );
};

export default EventList;
