'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { css } from '@/styled-system/css';

const galleryWrap = css({
  position: 'relative',
  height: '240px',
  background: 'gray.100',
  overflow: 'hidden',
});

const counter = css({
  position: 'absolute',
  bottom: '2.5',
  right: '2.5',
  paddingY: '1',
  paddingX: '2',
  borderRadius: 'radius.sm',
  background: 'rgba(0,0,0,0.55)',
  color: 'white',
  textStyle: 'caption',
  letterSpacing: '0.04em',
});

const thumbOuter = css({
  position: 'relative',
  marginTop: '2',
});

const thumbStrip = css({
  display: 'flex',
  gap: '1.5',
  paddingTop: '0',
  paddingX: '4',
  paddingBottom: '1',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const thumbFadeRight = css({
  position: 'absolute',
  top: 0,
  bottom: '1',
  right: 0,
  width: '32px',
  background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))',
  pointerEvents: 'none',
  transition: 'opacity 0.18s ease-out',
});

const thumbBtn = css({
  flexShrink: 0,
  width: '56px',
  height: '56px',
  padding: 0,
  border: '2px solid transparent',
  borderRadius: 'radius.md',
  overflow: 'hidden',
  cursor: 'pointer',
  background: 'gray.100',
  transition: 'border-color 0.15s ease',
});

const thumbBtnActive = css({
  borderColor: 'color.primary',
});

const emptyGallery = css({
  height: '240px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2.5',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  color: 'color.text.secondary',
  background:
    'repeating-linear-gradient(135deg, var(--colors-gray-100) 0 14px, var(--colors-gray-50) 14px 28px)',
});

const emptyHint = css({
  textStyle: 'caption',
  color: 'gray.400',
  letterSpacing: '0.04em',
});

const emptyText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

interface VenueGalleryProps {
  photos: string[];
  venueName: string;
}

export default function VenueGallery({ photos, venueName }: VenueGalleryProps) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumbAtEnd, setThumbAtEnd] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const n = photos.length;

  useEffect(() => {
    const strip = stripRef.current;
    const thumb = thumbRefs.current[active];
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft;
    const right = left + thumb.offsetWidth;
    const scrollLeft = strip.scrollLeft;
    const width = strip.clientWidth;
    if (left < scrollLeft + 8 || right > scrollLeft + width - 8) {
      strip.scrollTo({ left: left - width / 2 + thumb.offsetWidth / 2, behavior: 'smooth' });
    }
  }, [active]);

  const onThumbScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    setThumbAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    // Add rubber-band resistance at first/last image
    if ((active === 0 && diff > 0) || (active === n - 1 && diff < 0)) {
      setDragX(diff * 0.25);
    } else {
      setDragX(diff);
    }
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (dragX < -50 && active < n - 1) setActive((a) => a + 1);
    else if (dragX > 50 && active > 0) setActive((a) => a - 1);
    setDragX(0);
    setIsDragging(false);
    touchStartX.current = null;
  };

  // Each slide occupies 1/n of the track; active * (100/n)% moves by one container width
  const slidePercent = 100 / n;

  if (n === 0) {
    return (
      <div className={emptyGallery}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
          <circle cx="12" cy="13" r="3.5" />
          <path d="M3 3l18 18" />
        </svg>
        <div className={emptyText}>店家尚未提供場地照片</div>
        <div className={emptyHint}>可透過下方聯絡方式詢問</div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={galleryWrap}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: 'flex',
            width: `${n * 100}%`,
            height: '100%',
            transform: `translateX(calc(-${active * slidePercent}% + ${dragX}px))`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            willChange: 'transform',
          }}
        >
          {photos.map((src, i) => (
            <div
              key={i}
              style={{ flex: `0 0 ${slidePercent}%`, position: 'relative', height: '100%' }}
            >
              <Image
                src={src}
                alt={`${venueName} 場地照片 ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        {n > 1 && (
          <div className={counter}>
            {active + 1} / {n}
          </div>
        )}
      </div>
      {n > 1 && (
        <div className={thumbOuter}>
          <div ref={stripRef} className={thumbStrip} onScroll={onThumbScroll}>
            {photos.map((src, i) => (
              <button
                key={i}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                type="button"
                aria-pressed={i === active}
                aria-label={`場地照片 ${i + 1}`}
                className={`${thumbBtn} ${i === active ? thumbBtnActive : ''}`}
                onClick={() => setActive(i)}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={src}
                    alt={`${venueName} 縮圖 ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                    sizes="56px"
                  />
                </div>
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            className={thumbFadeRight}
            style={{ opacity: thumbAtEnd ? 0 : 1 }}
          />
        </div>
      )}
    </div>
  );
}
