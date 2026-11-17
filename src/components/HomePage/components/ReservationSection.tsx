import { useId, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Pagination } from 'swiper/modules';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth-context';
import { useClientNow } from '@/hooks/useClientNow';
import { useReservationEventsQuery } from '@/components/HomePage/hook/useReservationEvents';
import { firebaseTimestampToDate, formatDateRange } from '@/utils';
import { buildReservationList, getReservationLabel } from '@/utils/reservationStatus';
import type { ReservationEventItem } from '@/types';

import 'swiper/css';
import 'swiper/css/pagination';

const PAGE_SIZE = 4;
// Space left of the next page's edge so users can tell the list swipes
const PEEK_WIDTH = '32px';

const container = css({
  marginTop: '5',
  '& .swiper-pagination': {
    position: 'relative !important',
    bottom: 'auto !important',
    marginTop: '4',
  },
  '& .swiper-pagination-bullet': {
    background: 'gray.200 !important',
    opacity: '1 !important',
    width: '10px !important',
    height: '10px !important',
    margin: '0 6px !important',
    position: 'relative',
  },
  // Transparent hit area: bullet looks the same but is easier to tap
  '& .swiper-pagination-bullet::before': {
    content: '""',
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
  },
  '& .swiper-pagination-bullet-active': {
    background: 'stellarBlue.500 !important',
  },
});

const heading = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const hint = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1',
  marginTop: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const hintIcon = css({ flexShrink: 0, marginTop: '0.5' });

const listWrapper = css({ marginTop: '2' });

const pageSlide = css({ width: `calc(100% - ${PEEK_WIDTH})` });
const singlePageSlide = css({ width: '100%' });

const row = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  minHeight: '11',
  paddingY: '3',
  borderBottom: '1px solid',
  borderColor: 'color.border.subtle',
  color: 'inherit',
  textDecoration: 'none',
});

const lastRow = css({ borderBottom: 'none' });

const thumb = css({
  position: 'relative',
  flexShrink: 0,
  width: '60px',
  height: '80px',
  borderRadius: 'radius.sm',
  overflow: 'hidden',
  background: 'color.background.secondary',
});

const info = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
  minWidth: 0,
  flex: 1,
});

const statusBase = css({
  textStyle: 'bodySmall',
  fontVariantNumeric: 'tabular-nums',
});
const statusUpcoming = css({ color: 'color.primary', fontWeight: 600 });
const statusOpen = css({ color: 'color.text.secondary', fontWeight: 500 });

const ellipsis = css({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const titleText = css({ textStyle: 'bodyStrong', color: 'color.text.primary' });
const metaText = css({ textStyle: 'bodySmall', color: 'color.text.secondary' });

const skeletonRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingY: '3',
});

const skeletonLines = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  flex: 1,
});

interface ReservationRowProps {
  event: ReservationEventItem;
  now: Date;
  isLastInPage: boolean;
  onClick: () => void;
}

function ReservationRow({ event, now, isLastInPage, onClick }: ReservationRowProps) {
  const { kind, text } = getReservationLabel(event.reservation.startAt, now, 'section');
  const dateText = formatDateRange(
    firebaseTimestampToDate(event.datetime.start),
    firebaseTimestampToDate(event.datetime.end)
  );
  const artistNames = event.artists.map((artist) => artist.name).join('、');

  return (
    <Link
      href={`/event/${event.slug ?? event.id}`}
      className={`${row} ${isLastInPage ? lastRow : ''}`}
      onClick={onClick}
    >
      <span className={thumb}>
        {event.mainImage && (
          <Image src={event.mainImage} alt="" fill sizes="60px" style={{ objectFit: 'cover' }} />
        )}
      </span>
      <span className={info}>
        <span className={`${statusBase} ${kind === 'upcoming' ? statusUpcoming : statusOpen}`}>
          {text}
        </span>
        <span className={`${ellipsis} ${titleText}`}>{event.title}</span>
        <span className={`${ellipsis} ${metaText}`}>
          {artistNames ? `${dateText}・${artistNames}` : dateText}
        </span>
      </span>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className={listWrapper}>
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <div key={i} className={skeletonRow} data-testid="reservation-skeleton-row">
          <Skeleton width={60} height={80} borderRadius="4px" />
          <div className={skeletonLines}>
            <Skeleton width="40%" height="14px" />
            <Skeleton width="80%" height="16px" />
            <Skeleton width="60%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReservationSection() {
  const headingId = useId();
  const { user } = useAuth();
  const now = useClientNow();
  const { data, isLoading, isError } = useReservationEventsQuery();
  // Pages already reported this load; the page view is sent once per page
  const reportedPages = useRef(new Set<number>());

  if (isError) return null;

  const isReady = !isLoading && now !== null;
  const events = isReady ? buildReservationList(data ?? [], now) : [];
  if (isReady && events.length === 0) return null;

  const pages = Array.from({ length: Math.ceil(events.length / PAGE_SIZE) }, (_, i) =>
    events.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
  );
  const isSinglePage = pages.length <= 1;

  const track = (name: string, contentId: string, listPosition: number) => {
    sendGAEvent('event', name, {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: contentId,
      list_position: listPosition,
    });
  };

  return (
    <section className={container} aria-labelledby={headingId} aria-busy={!isReady}>
      <h2 id={headingId} className={heading}>
        預約中・即將開放
      </h2>
      <p className={hint}>
        <InformationCircleIcon className={hintIcon} width={14} height={14} aria-hidden="true" />
        預約名額可能隨時額滿，最新資訊請前往主辦／店家社群帳號確認
      </p>

      {!isReady || now === null ? (
        <SkeletonRows />
      ) : (
        <div className={listWrapper}>
          <Swiper
            modules={[A11y, Pagination]}
            a11y={{
              slideLabelMessage: '第 {{index}} 頁，共 {{slidesLength}} 頁',
              paginationBulletMessage: '前往第 {{index}} 頁',
            }}
            pagination={isSinglePage ? false : { clickable: true, dynamicBullets: true }}
            slidesPerView="auto"
            spaceBetween={8}
            allowTouchMove={!isSinglePage}
            onSlideChange={(swiper) => {
              const page = swiper.activeIndex;
              // Init/resize can emit slide changes; only pages after the first count as views
              if (page <= 0 || reportedPages.current.has(page)) return;
              reportedPages.current.add(page);
              track('view_reservation_section_page', '', page * PAGE_SIZE + 1);
            }}
          >
            {pages.map((pageEvents, pageIndex) => (
              <SwiperSlide
                key={pageEvents[0].id}
                className={isSinglePage ? singlePageSlide : pageSlide}
              >
                {pageEvents.map((event, rowIndex) => (
                  <ReservationRow
                    key={event.id}
                    event={event}
                    now={now}
                    isLastInPage={rowIndex === pageEvents.length - 1}
                    onClick={() =>
                      track(
                        'click_reservation_section_event',
                        event.id,
                        pageIndex * PAGE_SIZE + rowIndex + 1
                      )
                    }
                  />
                ))}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}
