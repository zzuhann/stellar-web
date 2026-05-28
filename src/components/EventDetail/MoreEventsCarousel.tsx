'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { css, cva } from '@/styled-system/css';
import { useArtistEventsQuery } from './hook/useArtistEventsQuery';
import RelatedEventCard from './RelatedEventCard';

import 'swiper/css';

const sectionWrapper = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '6',
  marginTop: '6',
});

const sectionTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginTop: '0',
  marginX: '0',
  marginBottom: '4',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const carouselWrapper = css({
  position: 'relative',
  // Negative margin to break out of parent padding, aligned with paddingLeft on Swiper
  marginX: '-5',
});

const swiperStyles = css({
  '& .swiper-slide': {
    width: 'auto !important',
  },
});

const fadeOverlay = cva({
  base: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40px',
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'opacity 0.2s ease',
  },
  variants: {
    side: {
      left: {
        left: 0,
        background: 'linear-gradient(to right, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
      },
      right: {
        right: 0,
        background: 'linear-gradient(to left, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
      },
    },
    visible: {
      true: { opacity: 1 },
      false: { opacity: 0 },
    },
  },
});

const progressTrack = css({
  height: '3px',
  borderRadius: '2px',
  background: 'gray.100',
  overflow: 'hidden',
  marginY: '4',
});

const progressBar = css({
  height: '100%',
  borderRadius: '2px',
  background: 'color.primary',
  transition: 'width 0.18s ease-out',
});

const skeletonCard = css({
  width: '180px',
  flexShrink: 0,
});

const skeletonImage = css({
  width: '180px',
  height: '190px',
  borderRadius: 'radius.lg',
  backgroundColor: 'color.background.secondary',
});

const skeletonLine = css({
  height: '14px',
  borderRadius: 'radius.sm',
  backgroundColor: 'color.background.secondary',
  marginTop: '2',
});

interface MoreEventsCarouselProps {
  artistId: string;
  artistName: string;
  currentEventId: string;
}

export default function MoreEventsCarousel({
  artistId,
  artistName,
  currentEventId,
}: MoreEventsCarouselProps) {
  const { data: events = [], isLoading } = useArtistEventsQuery(artistId, currentEventId);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);

  const updateFadeVisibility = (swiper: SwiperType) => {
    setShowLeftFade(!swiper.isBeginning);
    setShowRightFade(!swiper.isEnd);
    setActiveIndex(swiper.activeIndex);
    setIsEnd(swiper.isEnd);
  };

  // If not loading and no related events found, render nothing
  if (!isLoading && events.length === 0) {
    return null;
  }

  return (
    <div className={sectionWrapper}>
      <h3 className={sectionTitle}>更多 {artistName} 的生日應援</h3>

      <div className={carouselWrapper}>
        {/* Left fade overlay */}
        <div className={fadeOverlay({ side: 'left', visible: showLeftFade })} />

        {/* Right fade overlay */}
        <div className={fadeOverlay({ side: 'right', visible: showRightFade })} />

        <Swiper
          className={swiperStyles}
          spaceBetween={12}
          slidesPerView="auto"
          style={{ paddingLeft: 'var(--spacing-5)', paddingRight: 'var(--spacing-5)' }}
          onSwiper={(swiper) => {
            updateFadeVisibility(swiper);
          }}
          onSlideChange={updateFadeVisibility}
          onProgress={updateFadeVisibility}
        >
          {/* Loading skeletons */}
          {isLoading &&
            [0, 1, 2].map((i) => (
              <SwiperSlide key={i} style={{ width: 'auto' }}>
                <div className={skeletonCard}>
                  <div className={skeletonImage} />
                  <div className={skeletonLine} style={{ width: '80%' }} />
                  <div className={skeletonLine} style={{ width: '50%' }} />
                </div>
              </SwiperSlide>
            ))}

          {/* Event cards */}
          {!isLoading &&
            events.map((event) => (
              <SwiperSlide key={event.id} style={{ width: 'auto' }}>
                <RelatedEventCard event={event} eventPage="/event/[id]" contentId={event.id} />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
      {!isLoading && events.length > 0 && (
        <div className={progressTrack}>
          <div
            className={progressBar}
            style={{
              width: `${isEnd ? 100 : Math.max(8, ((activeIndex + 1) / events.length) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
