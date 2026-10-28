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
import { MAX_OTHER_PHOTOS } from '../venueSubmitModel';
import { srOnly } from '../styles';

// Equal 1:1 tiles: cover first with a「封面」badge, other photos, add tile last (venue-tags §D step 3)

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

const textAction = css({
  minHeight: '32px',
  paddingX: '2.5',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'alpha.black.60',
  color: 'color.background.primary',
  textStyle: 'caption',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.background.primary' },
});

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
  coverUrl: string;
  coverPreview: string | null;
  coverUploading: boolean;
  coverInvalid: boolean;
  coverDescribedBy?: string;
  others: PhotoSlot[];
  previews: Record<string, string>;
  onSelectCover: (file: File) => void;
  onRemoveCover: () => void;
  onAddOthers: (files: File[]) => void;
  onRemoveOther: (id: string) => void;
  onMoveOther: (id: string, delta: -1 | 1) => void;
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
  coverUrl,
  coverPreview,
  coverUploading,
  coverInvalid,
  coverDescribedBy,
  others,
  previews,
  onSelectCover,
  onRemoveCover,
  onAddOthers,
  onRemoveOther,
  onMoveOther,
}: VenuePhotoGridProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);
  const coverShown = coverPreview ?? (coverUrl || null);

  return (
    <div className={grid}>
      <input
        ref={coverInputRef}
        type="file"
        accept={ACCEPT}
        className={hiddenInput}
        data-testid="cover-file-input"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onSelectCover(file);
        }}
      />
      <input
        ref={otherInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className={hiddenInput}
        data-testid="other-file-input"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length > 0) onAddOthers(files);
        }}
      />

      <div className={tile} data-error-field="coverPhoto">
        <span className={badge}>封面</span>
        {coverShown ? (
          <>
            <Image
              src={coverShown}
              alt="封面照片"
              fill
              sizes="(min-width: 640px) 140px, 33vw"
              className={image}
            />
            {coverUploading && <Spinner label="封面上傳中" />}
            <div className={removeSlot}>
              <button
                type="button"
                className={actionButton}
                aria-label="移除封面"
                onClick={onRemoveCover}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </div>
            <div className={bottomActions}>
              <button
                type="button"
                className={textAction}
                aria-label="更換封面"
                onClick={() => coverInputRef.current?.click()}
              >
                更換
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className={addTile}
            aria-invalid={coverInvalid ? 'true' : undefined}
            aria-describedby={coverDescribedBy}
            onClick={() => coverInputRef.current?.click()}
          >
            <PlusIcon aria-hidden="true" />
            上傳封面
            {coverUploading && <Spinner label="封面上傳中" />}
          </button>
        )}
      </div>

      {others.map((slot, index) => {
        const src = slot.url ?? previews[slot.id];
        const n = index + 1;
        return (
          <div key={slot.id} className={tile}>
            {src && (
              <Image
                src={src}
                alt={`其他照片 ${n}`}
                fill
                sizes="(min-width: 640px) 140px, 33vw"
                className={image}
              />
            )}
            {!slot.url && <Spinner label={`其他照片 ${n} 上傳中`} />}
            <div className={removeSlot}>
              <button
                type="button"
                className={actionButton}
                aria-label={`移除其他照片 ${n}`}
                onClick={() => onRemoveOther(slot.id)}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </div>
            <div className={bottomActions}>
              {index > 0 && (
                <button
                  type="button"
                  className={actionButton}
                  aria-label={`其他照片 ${n} 往前移`}
                  onClick={() => onMoveOther(slot.id, -1)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </button>
              )}
              {index < others.length - 1 && (
                <button
                  type="button"
                  className={`${actionButton} ${pushRight}`}
                  aria-label={`其他照片 ${n} 往後移`}
                  onClick={() => onMoveOther(slot.id, 1)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {others.length < MAX_OTHER_PHOTOS && (
        <div className={tile}>
          <button
            type="button"
            className={addTile}
            aria-label="新增照片"
            onClick={() => otherInputRef.current?.click()}
          >
            <PlusIcon aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
