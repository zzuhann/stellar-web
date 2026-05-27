'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import type { VenueEventCard } from '@/types';
import { formatDateRange } from '@/utils';

const section = css({
  padding: '20px 0 8px',
});

const header = css({
  padding: '0 16px',
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '10px',
});

const sectionTitle = css({
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: 'color.text.primary',
});

const counter = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  color: 'color.text.secondary',
  fontFamily: 'monospace',
  letterSpacing: '0.04em',
});

const counterPos = css({
  color: 'color.primary',
  fontWeight: 600,
});

const counterDivider = css({
  color: 'gray.300',
});

const hint = css({
  padding: '4px 16px 0',
  fontSize: '11px',
  color: 'color.text.secondary',
  letterSpacing: '0.04em',
  fontFamily: 'monospace',
});

const trackWrap = css({
  position: 'relative',
  marginTop: '10px',
});

const track = css({
  display: 'flex',
  gap: '10px',
  padding: '0 16px 12px',
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

const card = css({
  flex: '0 0 auto',
  width: '180px',
  scrollSnapAlign: 'start',
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
  fontSize: '28px',
});

const cardBody = css({
  padding: '10px 12px 12px',
});

const cardTitle = css({
  margin: 0,
  fontSize: '13px',
  fontWeight: 600,
  color: 'color.text.primary',
  lineHeight: 1.35,
  lineClamp: 2,
});

const cardMeta = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '4px',
  fontSize: '11px',
  color: 'color.text.secondary',
});

const fadeLeft = css({
  position: 'absolute',
  top: 0,
  bottom: '12px',
  left: 0,
  width: '40px',
  background: 'linear-gradient(to right, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
  pointerEvents: 'none',
});

const fadeRight = css({
  position: 'absolute',
  top: 0,
  bottom: '12px',
  right: 0,
  width: '40px',
  background: 'linear-gradient(to left, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
  pointerEvents: 'none',
});

const progressTrack = css({
  height: '3px',
  borderRadius: '2px',
  background: 'gray.100',
  overflow: 'hidden',
  margin: '0 16px',
});

const progressBar = css({
  height: '100%',
  borderRadius: '2px',
  background: 'color.primary',
  transition: 'width 0.18s ease-out',
});

const CARD_WIDTH = 180 + 10;

interface PastEventsStripProps {
  events: VenueEventCard[];
}

export default function PastEventsStrip({ events }: PastEventsStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(1);
  const count = events.length;

  if (count === 0) return null;

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
    <section aria-label="平台收錄的生咖" className={section}>
      <div className={header}>
        <h2 className={sectionTitle}>平台收錄的生咖</h2>
        <div className={counter}>
          <span className={counterPos}>{pos}</span>
          <span className={counterDivider}>/</span>
          <span>{count}</span>
        </div>
      </div>

      <p className={hint} aria-hidden="true">
        ← 左右滑動瀏覽全部 →
      </p>

      <div className={trackWrap}>
        <div ref={trackRef} role="list" className={track} onScroll={onScroll}>
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/event/${event.slug ?? event.id}`}
              role="listitem"
              className={card}
            >
              <div className={coverWrap}>
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                    sizes="144px"
                  />
                ) : (
                  <div className={coverPlaceholder}>🎂</div>
                )}
              </div>
              <div className={cardBody}>
                <h3 className={cardTitle}>{event.title}</h3>
                <div className={cardMeta}>{event.artistName}</div>
                <div className={cardMeta}>
                  {formatDateRange(event.startDate, event.endDate)}
                </div>
              </div>
            </Link>
          ))}
          <div style={{ flex: '0 0 6px' }} />
        </div>

        {pos > 1 && <div aria-hidden="true" className={fadeLeft} />}
        {pos < count && <div aria-hidden="true" className={fadeRight} />}
      </div>

      <div className={progressTrack}>
        <div className={progressBar} style={{ width: `${Math.max(8, (pos / count) * 100)}%` }} />
      </div>
    </section>
  );
}
