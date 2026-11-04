'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import type { VenueEventCard } from '@/types';
import { formatDateRange } from '@/utils';
import { useAuth } from '@/lib/auth-context';
import { trackClickEventDetail } from '@/lib/analytics/venues';
import { itemsOverflow, useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import ScrollProgressBarClient from '@/components/ui/ScrollProgressBarClient';

const section = css({
  paddingTop: '5',
  paddingX: '0',
  paddingBottom: '2',
});

const header = css({
  paddingX: '4',
  paddingY: '0',
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '2.5',
});

const sectionTitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const counter = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
  fontFamily: 'monospace',
  letterSpacing: '0.04em',
});

const counterPos = css({
  color: 'color.primary',
  fontWeight: 'semibold',
});

const counterDivider = css({
  color: 'gray.300',
});

const hint = css({
  paddingTop: '1',
  paddingX: '4',
  paddingBottom: '0',
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.04em',
  fontFamily: 'monospace',
});

const trackWrap = css({
  position: 'relative',
  marginTop: '2.5',
});

const track = css({
  display: 'flex',
  gap: '2.5',
  paddingTop: '0',
  paddingX: '4',
  paddingBottom: '3',
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollSnapType: 'x mandatory',
  scrollPaddingLeft: '16px',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

// Wrapper carries the list role so the link keeps its own role for screen readers
const cardItem = css({
  flex: '0 0 auto',
  // Flex so the link stretches to the row height like the cards did before
  display: 'flex',
  scrollSnapAlign: 'start',
});

const card = css({
  width: '180px',
  textDecoration: 'none',
  display: 'block',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
});

const coverWrap = css({
  position: 'relative',
  width: '180px',
  height: '190px',
  background: 'gray.100',
  overflow: 'hidden',
});

const coverPlaceholder = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'gray.100',
  color: 'gray.400',
  textStyle: 'h1',
});

const timeStatusTag = css({
  position: 'absolute',
  top: '2',
  left: '2',
  paddingY: '0.5',
  paddingX: '1.5',
  borderRadius: 'radius.sm',
  // Same brand blue pair as the new detail tags (8.3:1); shadow lifts it off light posters
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  boxShadow: 'shadow.sm',
  textStyle: 'caption',
  fontWeight: 'medium',
});

const TIME_STATUS_LABEL: Partial<Record<NonNullable<VenueEventCard['timeStatus']>, string>> = {
  ongoing: '進行中',
  upcoming: '即將到來',
};

const cardBody = css({
  paddingTop: '2.5',
  paddingX: '3',
  paddingBottom: '3',
});

const cardTitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  lineClamp: 2,
});

const cardMeta = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  marginTop: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const fadeLeft = css({
  position: 'absolute',
  top: 0,
  bottom: '3',
  left: 0,
  width: '40px',
  background: 'linear-gradient(to right, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
  pointerEvents: 'none',
});

const fadeRight = css({
  position: 'absolute',
  top: 0,
  bottom: '3',
  right: 0,
  width: '40px',
  background: 'linear-gradient(to left, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
  pointerEvents: 'none',
});

const progressTrack = css({ marginX: '4', marginY: '0' });

const CARD_WIDTH = 180 + 10;
const cardsOverflow = itemsOverflow('[role="listitem"]');

interface PastEventsStripProps {
  events: VenueEventCard[];
}

export default function PastEventsStrip({ events }: PastEventsStripProps) {
  const { user } = useAuth();
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(1);
  const count = events.length;
  // Few events fit without scrolling: hide the counter, hint, fades and bar
  const overflows = useHorizontalScroll(trackRef, count, cardsOverflow, false);

  if (count === 0) return null;

  const trackClick = (event: VenueEventCard) =>
    trackClickEventDetail({
      userId: user?.uid,
      eventId: event.id,
      eventTimeStatus: event.timeStatus ?? null,
    });

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const idx = isAtEnd
      ? count
      : Math.min(count, Math.max(1, Math.round(el.scrollLeft / CARD_WIDTH) + 1));
    setPos(idx);
  };

  return (
    <section aria-label="平台記錄的生咖、生日應援" className={section}>
      <div className={header}>
        <h2 className={sectionTitle}>平台記錄的生咖、生日應援</h2>
        {overflows && (
          <div className={counter}>
            <span className={counterPos}>{pos}</span>
            <span className={counterDivider}>/</span>
            <span>{count}</span>
          </div>
        )}
      </div>

      {/* visibility, not unmount: the line keeps its height so the strip does not shift after hydration */}
      <p
        className={hint}
        aria-hidden="true"
        style={{ visibility: overflows ? 'visible' : 'hidden' }}
      >
        ← 左右滑動瀏覽全部 →
      </p>

      <div className={trackWrap}>
        <div ref={trackRef} role="list" className={track} onScroll={onScroll}>
          {events.map((event) => (
            <div key={event.id} role="listitem" className={cardItem}>
              <Link
                href={`/event/${event.slug ?? event.id}`}
                className={card}
                onClick={() => trackClick(event)}
                onAuxClick={(e) => {
                  // middle click opens a new tab, bypassing onClick, so track it separately
                  if (e.button === 1) trackClick(event);
                }}
              >
                <div className={coverWrap}>
                  {event.coverImage ? (
                    <Image
                      src={event.coverImage}
                      alt=""
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                      sizes="144px"
                    />
                  ) : (
                    <div className={coverPlaceholder} aria-hidden="true">
                      🎂
                    </div>
                  )}
                  {event.timeStatus && TIME_STATUS_LABEL[event.timeStatus] && (
                    <span className={timeStatusTag}>{TIME_STATUS_LABEL[event.timeStatus]}</span>
                  )}
                </div>
                <div className={cardBody}>
                  <h3 className={cardTitle}>{event.title}</h3>
                  <div className={cardMeta}>{event.artistName}</div>
                  <div className={cardMeta}>{formatDateRange(event.startDate, event.endDate)}</div>
                </div>
              </Link>
            </div>
          ))}
          <div style={{ flex: '0 0 6px' }} aria-hidden="true" />
        </div>

        {overflows && pos > 1 && <div aria-hidden="true" className={fadeLeft} />}
        {overflows && pos < count && <div aria-hidden="true" className={fadeRight} />}
      </div>

      <ScrollProgressBarClient
        scrollRef={trackRef}
        contentKey={count}
        visible={overflows}
        className={progressTrack}
      />
    </section>
  );
}
