'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import { getDesktopPhotoLayout, getPhotoFit, type Size } from '@/utils/venuePhotoLayout';

const grid = css({
  position: 'relative',
  display: 'grid',
  gap: '2',
  marginX: '4',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
});

const cellBtn = css({
  position: 'relative',
  display: 'block',
  minWidth: 0,
  minHeight: 0,
  padding: 0,
  border: 'none',
  overflow: 'hidden',
  cursor: 'pointer',
  background: 'gray.100',
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'color.primary',
    // The grid clips overflow, so the ring sits inside the cell
    outlineOffset: '-3px',
  },
});

const blurLayer = css({
  position: 'absolute',
  inset: 0,
  filter: 'blur(24px)',
  // Scaled so the blur's soft edges stay outside the cell
  transform: 'scale(1.15)',
});

const showAllBtn = css({
  position: 'absolute',
  right: '3',
  bottom: '3',
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  paddingX: '4',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'alpha.white.90',
  color: 'color.text.primary',
  textStyle: 'button',
  cursor: 'pointer',
  boxShadow: 'shadow.sm',
  '&:hover': { background: 'white' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

function useElementSize(ref: RefObject<HTMLElement | null>): Size | null {
  const [size, setSize] = useState<Size | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

interface PhotoCellProps {
  src: string;
  index: number;
  venueName: string;
  column: string;
  row: string;
  onOpen: () => void;
}

function PhotoCell({ src, index, venueName, column, row, onOpen }: PhotoCellProps) {
  // Orientation is only known once the photo loads; until then it fills the cell
  const [photo, setPhoto] = useState<Size | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const cell = useElementSize(ref);
  const fit = getPhotoFit(photo, cell);
  const isCover = index === 0;

  return (
    <button
      ref={ref}
      type="button"
      className={cellBtn}
      style={{ gridColumn: column, gridRow: row }}
      aria-label={`放大檢視第 ${index + 1} 張照片`}
      onClick={onOpen}
    >
      {fit === 'contain' && (
        <span aria-hidden="true" className={blurLayer}>
          <Image src={src} alt="" fill unoptimized sizes="40vw" style={{ objectFit: 'cover' }} />
        </span>
      )}
      <Image
        src={src}
        alt={`${venueName} 場地照片 ${index + 1}`}
        fill
        unoptimized
        sizes={isCover ? '(min-width: 1024px) 60vw, 100vw' : '25vw'}
        priority={isCover}
        style={{ objectFit: fit }}
        onLoad={(e) => {
          const img = e.currentTarget;
          setPhoto({ width: img.naturalWidth, height: img.naturalHeight });
        }}
      />
    </button>
  );
}

interface VenuePhotoGridProps {
  photos: string[];
  venueName: string;
  onOpen: (index: number) => void;
}

// Desktop-only grid above the two columns (venue-tags design-frontend §B desktop)
export default function VenuePhotoGrid({ photos, venueName, onOpen }: VenuePhotoGridProps) {
  const layout = getDesktopPhotoLayout(photos.length);
  if (!layout) return null;

  return (
    <div
      className={grid}
      style={{
        height: layout.height,
        gridTemplateColumns: layout.columns,
        gridTemplateRows: layout.rows,
      }}
    >
      {layout.cells.map((cell, i) => (
        <PhotoCell
          key={`${i}-${photos[i]}`}
          src={photos[i]}
          index={i}
          venueName={venueName}
          column={cell.column}
          row={cell.row}
          onOpen={() => onOpen(i)}
        />
      ))}
      {layout.showAllCount && (
        <button type="button" className={showAllBtn} onClick={() => onOpen(0)}>
          查看全部 {layout.showAllCount} 張照片
        </button>
      )}
    </div>
  );
}
