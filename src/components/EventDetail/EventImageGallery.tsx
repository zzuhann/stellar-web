'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import SwiperBanner, { BannerItem } from '@/components/SwiperBanner';

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), {
  ssr: false,
});

interface EventImageGalleryProps {
  items: BannerItem[];
}

export default function EventImageGallery({ items }: EventImageGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  const slides = items.map((item) => ({ src: item.imageUrl, alt: item.title }));

  return (
    <>
      <SwiperBanner
        items={items}
        onSlideClick={(i) => {
          setIndex(i);
          setOpen(true);
        }}
      />
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
