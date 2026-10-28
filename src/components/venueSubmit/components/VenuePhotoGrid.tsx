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

// 3-column grid: cover 2×2 with a「封面」badge, other photos 1×1, add tile last (venue-tags §D step 3)

const grid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '2',
});

const tile = css({
  position: 'relative',
  aspectRatio: '1 / 1',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'gray.100',
});

const coverTile = css({ gridColumn: 'span 2', gridRow: 'span 2' });

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

const actions = css({
  position: 'absolute',
  bottom: '1',
  right: '1',
  display: 'flex',
  gap: '1',
});

const actionButton = css({
  width: '44px',
  height: '44px',
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
  '& svg': { width: '18px', height: '18px' },
});

const textAction = css({
  minHeight: '44px',
  paddingX: '3',
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

      <div className={`${tile} ${coverTile}`} data-error-field="coverPhoto">
        <span className={badge}>封面</span>
        {coverShown ? (
          <>
            <Image
              src={coverShown}
              alt="封面照片"
              fill
              sizes="(min-width: 1024px) 373px, 66vw"
              className={image}
            />
            {coverUploading && <Spinner label="封面上傳中" />}
            <div className={actions}>
              <button
                type="button"
                className={textAction}
                onClick={() => coverInputRef.current?.click()}
              >
                更換封面
              </button>
              <button
                type="button"
                className={actionButton}
                aria-label="移除封面"
                onClick={onRemoveCover}
              >
                <XMarkIcon aria-hidden="true" />
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
                sizes="(min-width: 1024px) 182px, 33vw"
                className={image}
              />
            )}
            {!slot.url && <Spinner label={`其他照片 ${n} 上傳中`} />}
            <div className={actions}>
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
                  className={actionButton}
                  aria-label={`其他照片 ${n} 往後移`}
                  onClick={() => onMoveOther(slot.id, 1)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className={actionButton}
                aria-label={`移除其他照片 ${n}`}
                onClick={() => onRemoveOther(slot.id)}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
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
