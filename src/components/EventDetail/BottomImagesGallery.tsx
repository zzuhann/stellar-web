'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import { BannerItem } from '@/components/SwiperBanner';

const container = css({
  marginTop: '6',
});

const clickableImage = css({
  display: 'block',
  width: '100%',
  padding: '0',
  border: 'none',
  background: 'transparent',
  cursor: 'zoom-in',
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 0.92,
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

interface BottomImagesGalleryProps {
  items: BannerItem[];
}

export default function BottomImagesGallery({ items }: BottomImagesGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  const slides = items.map((item) => ({ src: item.imageUrl, alt: item.title }));

  return (
    <>
      <div className={container}>
        {items.map((item, i) => (
          <button
            key={item.id}
            className={clickableImage}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            aria-label={`放大檢視第 ${i + 1} 張圖片`}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={800}
              height={600}
              sizes="(max-width: 540px) calc(100vw - 40px), 460px"
              quality={95}
              priority={i === 0}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </button>
        ))}
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true, doubleTapDelay: 300 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}
