'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination } from 'swiper/modules';
import { css } from '@/styled-system/css';
import { CoffeeEvent } from '@/types';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';

import 'swiper/css';
import 'swiper/css/pagination';

const carouselContainer = css({
  position: 'relative',
  width: '100%',
  padding: '16px 0',

  '& .swiper-pagination': {
    position: 'relative !important',
    bottom: 'auto !important',
    marginTop: '16px',
  },

  '& .swiper-pagination-bullet': {
    background: '#E9ECEF !important',
    opacity: '1 !important',
  },

  '& .swiper-pagination-bullet-active': {
    background: '#3F5A72 !important',
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
}

export default function EventCardCarousel({ events }: EventCardCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className={carouselContainer}>
      <Swiper
        className={swiperStyles}
        modules={[Pagination]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        spaceBetween={16}
        slidesPerView={1.2}
        centeredSlides={true}
        breakpoints={{
          480: {
            slidesPerView: 1.5,
            spaceBetween: 20,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 24,
            centeredSlides: false,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
            centeredSlides: false,
          },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <div className={slideContent}>
              <VerticalEventCard event={event} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
