import Image from 'next/image';
import { css } from '@/styled-system/css';

const photoStrip = css({
  height: '180px',
  overflow: 'hidden',
  position: 'relative',
  flexShrink: 0,
  background: 'gray.100',
});

const placeholder = css({
  height: '180px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  color: 'gray.500',
  textStyle: 'caption',
  background:
    'repeating-linear-gradient(135deg, var(--colors-gray-100) 0 12px, var(--colors-gray-50) 12px 24px)',
});

const grid2col = css({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '2px',
  height: '180px',
  background: 'gray.200',
  overflow: 'hidden',
});

const thumbStack = css({
  display: 'grid',
  gridTemplateRows: '1fr 1fr',
  gap: '2px',
  overflow: 'hidden',
});

const overlay = css({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(31,45,61,0.55)',
  color: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  letterSpacing: '0.04em',
});

interface PhotoSlotProps {
  src: string;
  alt: string;
  fill?: boolean;
  height?: number;
}

function PhotoSlot({ src, alt, fill = false, height }: PhotoSlotProps) {
  if (fill) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} unoptimized sizes="50vw" />
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: '100%', height: height ?? 74, overflow: 'hidden' }}>
      <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} unoptimized sizes="25vw" />
    </div>
  );
}

interface VenueCardPhotosProps {
  photos: string[];
  venueName: string;
}

export default function VenueCardPhotos({ photos, venueName }: VenueCardPhotosProps) {
  const n = photos.length;

  if (n === 0) {
    return (
      <div className={placeholder}>
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
          <circle cx="12" cy="13" r="3.5" />
          <path d="M3 3l18 18" />
        </svg>
        <span>店家尚未提供場地照片</span>
      </div>
    );
  }

  if (n === 1) {
    return (
      <div className={photoStrip}>
        <Image
          src={photos[0]}
          alt={`${venueName} 場地照片`}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
          sizes="100vw"
        />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className={grid2col}>
        <PhotoSlot src={photos[0]} alt={`${venueName} 1`} fill />
        <PhotoSlot src={photos[1]} alt={`${venueName} 2`} fill />
      </div>
    );
  }

  const extras = n - 3;
  return (
    <div className={grid2col}>
      <PhotoSlot src={photos[0]} alt={`${venueName} 1`} fill />
      <div className={thumbStack}>
        <PhotoSlot src={photos[1]} alt={`${venueName} 2`} fill />
        <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
          <PhotoSlot src={photos[2]} alt={`${venueName} 3`} fill />
          {extras > 0 && <div className={overlay}>+{extras}</div>}
        </div>
      </div>
    </div>
  );
}
