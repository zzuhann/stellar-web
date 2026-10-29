'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import type { PhotoSlot } from '../venueSubmitModel';
import { MAX_PHOTOS } from '../venueSubmitModel';
import { srOnly } from '../styles';

// Equal 1:1 tiles in one list; the first is the cover (「封面」badge), add tile last (venue-tags §D step 3)

const grid = css({
  display: 'grid',
  gridTemplateColumns: { base: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
  gap: '2',
});

const tile = css({
  position: 'relative',
  aspectRatio: '1 / 1',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'gray.100',
});

const badge = css({
  position: 'absolute',
  top: '2',
  left: '2',
  zIndex: 1,
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: 'radius.sm',
  background: 'alpha.black.60',
  color: 'color.background.primary',
  textStyle: 'caption',
  fontWeight: 'semibold',
});

const image = css({ objectFit: 'cover' });

const addTile = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  border: '1.5px dashed',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.secondary',
  textStyle: 'bodySmall',
  cursor: 'pointer',
  '&:hover': { borderColor: 'color.primary', color: 'color.primary' },
  '&:active': { background: 'color.background.secondary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '2px' },
  '& svg': { width: '24px', height: '24px' },
});

const removeSlot = css({ position: 'absolute', top: '1', right: '1' });

const bottomActions = css({
  position: 'absolute',
  bottom: '1',
  left: '1',
  right: '1',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1',
});

// 32px keeps three controls inside a ~110px phone tile (WCAG 2.5.8 minimum is 24px)
const actionButton = css({
  width: '32px',
  height: '32px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 'radius.circle',
  background: 'alpha.black.60',
  color: 'color.background.primary',
  cursor: 'pointer',
  '&:hover': { background: 'alpha.black.70' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.background.primary' },
  '& svg': { width: '16px', height: '16px' },
});

const pushRight = css({ marginLeft: 'auto' });

const spinnerWrap = css({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'alpha.white.50',
});

const spinner = css({
  width: '24px',
  height: '24px',
  border: '3px solid',
  borderColor: 'alpha.black.10',
  borderTopColor: 'color.primary',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
});

const hiddenInput = css({ display: 'none' });

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';

interface VenuePhotoGridProps {
  photos: PhotoSlot[];
  previews: Record<string, string>;
  invalid: boolean;
  describedBy?: string;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, delta: -1 | 1) => void;
}

function Spinner({ label }: { label: string }) {
  return (
    <span className={spinnerWrap}>
      <span className={spinner} aria-hidden="true" />
      <span className={srOnly}>{label}</span>
    </span>
  );
}

export default function VenuePhotoGrid({
  photos,
  previews,
  invalid,
  describedBy,
  onAdd,
  onRemove,
  onMove,
}: VenuePhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={grid} data-error-field="photos">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className={hiddenInput}
        data-testid="photo-file-input"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length > 0) onAdd(files);
        }}
      />

      {photos.map((slot, index) => {
        const src = slot.url ?? previews[slot.id];
        const n = index + 1;
        const name = index === 0 ? '封面照片' : `照片 ${n}`;
        return (
          <div key={slot.id} className={tile}>
            {index === 0 && <span className={badge}>封面</span>}
            {src && (
              <Image
                src={src}
                alt={name}
                fill
                sizes="(min-width: 640px) 140px, 33vw"
                className={image}
              />
            )}
            {!slot.url && <Spinner label={`${name} 上傳中`} />}
            <div className={removeSlot}>
              <button
                type="button"
                className={actionButton}
                aria-label={`移除${name}`}
                onClick={() => onRemove(slot.id)}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </div>
            <div className={bottomActions}>
              {index > 0 && (
                <button
                  type="button"
                  className={actionButton}
                  aria-label={index === 1 ? `將${name}設為封面` : `${name} 往前移`}
                  onClick={() => onMove(slot.id, -1)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </button>
              )}
              {index < photos.length - 1 && (
                <button
                  type="button"
                  className={`${actionButton} ${pushRight}`}
                  aria-label={`${name} 往後移`}
                  onClick={() => onMove(slot.id, 1)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {photos.length < MAX_PHOTOS && (
        <div className={tile}>
          <button
            type="button"
            className={addTile}
            aria-label="新增照片"
            aria-invalid={invalid ? 'true' : undefined}
            aria-describedby={describedBy}
            onClick={() => inputRef.current?.click()}
          >
            <PlusIcon aria-hidden="true" />
            {photos.length === 0 && <span aria-hidden="true">新增照片</span>}
          </button>
        </div>
      )}
    </div>
  );
}
