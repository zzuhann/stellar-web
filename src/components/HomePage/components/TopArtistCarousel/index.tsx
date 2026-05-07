'use client';

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { css, cva } from '@/styled-system/css';
import { TopArtist } from '@/lib/api';
import TopArtistCard, { TopArtistCardSkeleton } from './TopArtistCard';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { sendGAEvent } from '@next/third-parties/google';

import 'swiper/css';

const carouselWrapper = css({
  position: 'relative',
  width: '100%',
  paddingY: '3',
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
    width: '32px',
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'opacity 0.2s ease',
  },
  variants: {
    side: {
      left: {
        left: 0,
        background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      },
      right: {
        right: 0,
        background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      },
    },
    visible: {
      true: { opacity: 1 },
      false: { opacity: 0 },
    },
  },
});

const addButtonItem = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5',
  flexShrink: 0,
  width: '72px',
  cursor: 'pointer',
});

const addButtonWrapper = css({
  position: 'relative',
  width: '68px',
  height: '68px',
});

const addButtonCircle = css({
  width: '100%',
  height: '100%',
  borderRadius: 'radius.circle',
  border: '2px solid',
  borderColor: 'color.border.medium',
  backgroundColor: 'color.background.secondary',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'color.primary',
    backgroundColor: 'stellarBlue.50',
  },
});

const addButtonIcon = css({
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '22px',
  height: '22px',
  borderRadius: 'radius.circle',
  backgroundColor: 'color.primary',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'sm',
  fontWeight: 'bold',
  border: '2px solid',
  borderColor: 'color.background.primary',
});

const addButtonText = css({
  textStyle: 'caption',
  color: 'color.text.primary',
  textAlign: 'center',
});

const addButtonSubtext = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  textAlign: 'center',
  height: '18px',
});

const iconStyle = css({
  width: '42px',
  height: '42px',
  objectFit: 'contain',
});

interface TopArtistCarouselProps {
  artists: TopArtist[];
  isLoading: boolean;
  onCardClick?: (artistId: string) => void;
}

export default function TopArtistCarousel({
  artists,
  isLoading,
  onCardClick,
}: TopArtistCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const { user, toggleAuthModal } = useAuth();
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // 使用 Link + onClick 避免 hydration race 造成的 dead click（issue #25）
  // 未登入時 preventDefault 改開 modal；已登入時讓 next/link 自然 navigate
  const handleAddClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    sendGAEvent('event', 'click_add_event_button', {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: '',
    });

    if (!user) {
      e.preventDefault();
      toggleAuthModal('/submit-event');
    }
  };

  const updateFadeVisibility = (swiper: SwiperType) => {
    setShowLeftFade(!swiper.isBeginning);
    setShowRightFade(!swiper.isEnd);
  };

  return (
    <div className={carouselWrapper} role="region" aria-label="擁有最多生咖的藝人">
      {/* 左側漸層 */}
      <div className={fadeOverlay({ side: 'left', visible: showLeftFade })} />

      {/* 右側漸層 */}
      <div className={fadeOverlay({ side: 'right', visible: showRightFade })} />

      <Swiper
        className={swiperStyles}
        spaceBetween={15}
        slidesPerView="auto"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateFadeVisibility(swiper);
        }}
        onSlideChange={updateFadeVisibility}
        onProgress={updateFadeVisibility}
      >
        {/* 新增生咖按鈕：永遠 render <Link>，未登入時 preventDefault 改開 modal */}
        <SwiperSlide style={{ width: 'auto' }}>
          <Link href="/submit-event" className={addButtonItem} onClick={handleAddClick}>
            <div className={addButtonWrapper}>
              <div className={addButtonCircle}>
                <Image
                  src="/icon-new.png"
                  alt="新增生咖"
                  width={42}
                  height={42}
                  className={iconStyle}
                />
              </div>
              <div className={addButtonIcon}>+</div>
            </div>
            <span className={addButtonText}>新增生咖</span>
            <span className={addButtonSubtext} />
          </Link>
        </SwiperSlide>

        {/* Loading skeleton */}
        {isLoading &&
          [0, 1, 2, 3].map((i) => (
            <SwiperSlide key={i} style={{ width: 'auto' }}>
              <TopArtistCardSkeleton />
            </SwiperSlide>
          ))}

        {/* 藝人列表 */}
        {!isLoading &&
          artists.map((artist, index) => (
            <SwiperSlide key={artist.id} style={{ width: 'auto' }}>
              <TopArtistCard artist={artist} onClick={onCardClick} isFirst={index === 0} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
