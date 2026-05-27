'use client';

import { useRef, useState } from 'react';
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
  bottom: '10px',
  right: '10px',
  padding: '4px 8px',
  borderRadius: 'radius.sm',
  background: 'rgba(0,0,0,0.55)',
  color: 'white',
  fontSize: '11px',
  letterSpacing: '0.04em',
});

const thumbOuter = css({
  position: 'relative',
  marginTop: '8px',
});

const thumbStrip = css({
  display: 'flex',
  gap: '6px',
  padding: '0 16px 4px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const thumbFadeRight = css({
  position: 'absolute',
  top: 0,
  bottom: '4px',
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
  gap: '10px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  color: 'color.text.secondary',
  background:
    'repeating-linear-gradient(135deg, var(--colors-gray-100) 0 14px, var(--colors-gray-50) 14px 28px)',
});

const emptyHint = css({
  fontSize: '11px',
  color: 'gray.400',
  letterSpacing: '0.04em',
});

interface VenueGalleryProps {
  photos: string[];
  venueName: string;
}

export default function VenueGallery({ photos, venueName }: VenueGalleryProps) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const [thumbAtEnd, setThumbAtEnd] = useState(false);
  const n = photos.length;

  const onThumbScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    setThumbAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

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
        <div style={{ fontSize: 13 }}>店家尚未提供場地照片</div>
        <div className={emptyHint}>可透過下方聯絡方式詢問</div>
      </div>
    );
  }

  return (
    <div>
      <div className={galleryWrap}>
        <Image
          src={photos[active]}
          alt={`${venueName} 場地照片 ${active + 1}`}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
          sizes="100vw"
          priority={active === 0}
        />
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
                type="button"
                className={`${thumbBtn} ${i === active ? thumbBtnActive : ''}`}
                onClick={() => setActive(i)}
                aria-label={`場地照片 ${i + 1}`}
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
