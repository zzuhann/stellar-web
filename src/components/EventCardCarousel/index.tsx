'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination } from 'swiper/modules';
import { css } from '@/styled-system/css';
import { CoffeeEvent } from '@/types';
import VerticalEventCard, {
  VerticalEventCardSkeleton,
} from '@/components/EventCardCarousel/VerticalEventCard';

import 'swiper/css';
import 'swiper/css/pagination';

const carouselContainer = css({
  position: 'relative',
  width: '100%',
  paddingY: '4',
  paddingX: '0',

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

  // 透明擴大 hit area，bullet 視覺不變但點擊容易
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

const swiperStyles = css({
  '& .swiper-slide': {
    height: 'auto',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  },

  '& .swiper-slide:not(.swiper-slide-active)': {
    transform: 'scale(0.95) !important',
  },
});

const slideContent = css({
  height: '100%',
});

interface EventCardCarouselProps {
  events: CoffeeEvent[];
  isLoading: boolean;
  onCardClick?: (eventId: string) => void;
}

export default function EventCardCarousel({
  events,
  isLoading,
  onCardClick,
}: EventCardCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (events.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div
      className={carouselContainer}
      role="region"
      aria-label="即將到來的生日應援輪播"
      aria-busy={isLoading}
    >
      <Swiper
        className={swiperStyles}
        modules={[Pagination]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        spaceBetween={6}
        slidesPerView={1.3}
        centeredSlides={true}
        breakpoints={{
          480: {
            slidesPerView: 2,
            spaceBetween: 8,
            centeredSlides: false,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 10,
            centeredSlides: false,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 15,
            centeredSlides: false,
          },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {isLoading &&
          [0, 1].map((i) => (
            <SwiperSlide key={i} aria-label="活動載入中" aria-live="polite">
              <div className={slideContent}>
                <VerticalEventCardSkeleton />
              </div>
            </SwiperSlide>
          ))}

        {!isLoading &&
          events.map((event, index) => (
            <SwiperSlide key={event.id}>
              <div className={slideContent}>
                <VerticalEventCard event={event} onClick={onCardClick} isFirst={index === 0} />
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
