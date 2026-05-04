'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { css } from '@/styled-system/css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

export interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  description?: string;
}

const bannerWrapper = css({
  position: 'relative',
  width: '100%',
  marginBottom: '4',
});

const bannerContainer = css({
  position: 'relative',
  width: '70%',
  margin: '0 auto',
  aspectRatio: '3/4',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  boxShadow: 'shadow.md',

  '& .swiper': {
    width: '100%',
    height: '100%',
  },

  '& .swiper-slide': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  '& .swiper-pagination': {
    bottom: '16px !important',
  },

  '& .swiper-pagination-bullet': {
    backgroundColor: 'var(--colors-alpha-white-30) !important',
    border: '1px solid var(--colors-alpha-white-50) !important',
    opacity: '1 !important',
    width: '8px !important',
    height: '8px !important',
  },

  '& .swiper-pagination-bullet-active': {
    backgroundColor: 'white !important',
    border: 'none !important',
  },

  '& .swiper-button-next, & .swiper-button-prev': {
    display: 'none !important',
  },
});

const slideContent = css({
  position: 'relative',
  width: '100%',
  height: '100%',
});

const slideImage = css({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

const pageIndicator = css({
  position: 'absolute',
  top: '4',
  right: '19%',
  background: 'alpha.black.30',
  color: 'white',
  paddingY: '1',
  paddingX: '3',
  borderRadius: '12px',
  textStyle: 'caption',
  fontWeight: 'medium',
  zIndex: '10',
});

const navigationButton = css({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  color: 'color.text.secondary',
  width: '36px',
  height: '36px',
  borderRadius: 'radius.circle',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  zIndex: '10',

  '&:hover': {
    background: 'color.background.primary',
    borderColor: 'color.border.medium',
    color: 'color.text.primary',
  },

  '&:disabled': {
    opacity: '0.3',
    cursor: 'not-allowed',
  },

  '& svg': {
    width: '18px',
    height: '18px',
  },
});

const prevButton = css({
  left: '4',
});

const nextButton = css({
  right: '4',
});

interface SwiperBannerProps {
  items?: BannerItem[];
  onSlideClick?: (index: number) => void;
}

export default function SwiperBanner({ items = [], onSlideClick }: SwiperBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  if (items.length === 0) {
    return null;
  }

  const handlePrevSlide = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNextSlide = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <div className={bannerWrapper}>
      <div className={bannerContainer}>
        <Swiper
          modules={[Pagination]}
          pagination={{
            clickable: true,
            dynamicBullets: false,
          }}
          loop={items.length > 1}
          spaceBetween={0}
          slidesPerView={1}
          watchSlidesProgress={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id}>
              <div
                className={slideContent}
                onClick={() => onSlideClick?.(index)}
                style={onSlideClick ? { cursor: 'zoom-in' } : undefined}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="70vw"
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className={slideImage}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {items.length > 1 && (
        <>
          <button
            className={`${navigationButton} ${prevButton}`}
            onClick={handlePrevSlide}
            aria-label="上一張"
          >
            <ChevronLeftIcon aria-hidden="true" />
          </button>
          <button
            className={`${navigationButton} ${nextButton}`}
            onClick={handleNextSlide}
            aria-label="下一張"
          >
            <ChevronRightIcon aria-hidden="true" />
          </button>
        </>
      )}

      {items.length > 1 && (
        <div className={pageIndicator} aria-live="polite" aria-atomic="true">
          {currentSlide + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
