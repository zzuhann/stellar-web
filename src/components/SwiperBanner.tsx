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

interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  description?: string;
}

const bannerContainer = css({
  position: 'relative',
  width: '100%',
  aspectRatio: '3/4',
  marginBottom: '24px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',

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
    backgroundColor: 'rgba(255, 255, 255, 0.3) !important',
    border: '1px solid rgba(255, 255, 255, 0.5) !important',
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
  top: '16px',
  right: '16px',
  background: 'rgba(0, 0, 0, 0.3)',
  color: 'white',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  zIndex: '10',
});

const navigationButton = css({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0, 0, 0, 0.3)',
  border: 'none',
  color: 'white',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  zIndex: '10',

  '&:hover': {
    background: 'rgba(0, 0, 0, 0.5)',
  },

  '&:disabled': {
    opacity: '0.3',
    cursor: 'not-allowed',
  },

  '& svg': {
    width: '20px',
    height: '20px',
  },
});

const prevButton = css({
  left: '16px',
});

const nextButton = css({
  right: '16px',
});

interface SwiperBannerProps {
  items?: BannerItem[];
}

export default function SwiperBanner({ items = [] }: SwiperBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef<SwiperType>();

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
            <div className={slideContent}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={600}
                height={800}
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className={slideImage}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {items.length > 1 && (
        <>
          <button className={`${navigationButton} ${prevButton}`} onClick={handlePrevSlide}>
            <ChevronLeftIcon />
          </button>
          <button className={`${navigationButton} ${nextButton}`} onClick={handleNextSlide}>
            <ChevronRightIcon />
          </button>
        </>
      )}

      {items.length > 1 && (
        <div className={pageIndicator}>
          {currentSlide + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
