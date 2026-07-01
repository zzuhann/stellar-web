'use client';

import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import ModalOverlay from './ModalOverlay';
import { css, cva } from '@/styled-system/css';

const modalContainer = css({
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  padding: '4',
  maxWidth: 'calc(100vw - 32px)',
  width: '100%',
  margin: '4',
  maxHeight: '90vh',
  overflowY: 'auto',
  '@media (min-width: 480px)': {
    padding: '5',
    maxWidth: '400px',
  },
  '@media (min-width: 768px)': {
    padding: '6',
    maxWidth: '520px',
  },
});

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '4',
});

const modalTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: '0',
  '@media (min-width: 768px)': {
    textStyle: 'h3',
  },
});

const cropWrapper = css({
  position: 'relative',
  height: '300px',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
});

const zoomSliderWrap = css({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '3',
});

const zoomSlider = css({
  width: '100%',
  maxWidth: '240px',
  accentColor: 'var(--colors-color-primary)',
});

const actionBar = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '4',
  '@media (min-width: 768px)': {
    marginTop: '6',
  },
});

const buttonGroup = css({
  display: 'flex',
  gap: '2',
  width: '100%',
  '@media (min-width: 480px)': {
    gap: '3',
    width: 'auto',
  },
});

const styledButton = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5',
    paddingY: '2.5',
    paddingX: '3',
    borderRadius: 'radius.lg',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    transition: 'background 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    flex: '1',
    whiteSpace: 'nowrap',
    '@media (min-width: 480px)': {
      paddingY: '3',
      paddingX: '4',
      flex: 'none',
    },
    '@media (min-width: 768px)': {
      textStyle: 'body',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'color.primary',
        borderColor: 'color.primary',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: 'stellarBlue.600',
        },
        '&:disabled': {
          opacity: '0.5',
          cursor: 'not-allowed',
        },
      },
      secondary: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover': {
          background: 'color.background.secondary',
        },
      },
    },
  },
});

// Helper: load image element
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

// Helper: crop image via canvas and return Blob
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputSize: number
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas toBlob failed'))),
      'image/jpeg',
      0.9
    )
  );
}

export interface CropState {
  crop: { x: number; y: number };
  zoom: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (blob: Blob, cropState: CropState) => void;
  onCancel: () => void;
  outputSize?: number;
  initialCropState?: CropState | null;
}

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  outputSize = 400,
  initialCropState = null,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>(
    initialCropState?.crop ?? { x: 0, y: 0 }
  );
  const [zoom, setZoom] = useState<number>(initialCropState?.zoom ?? 1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Store croppedAreaPixels from Cropper callback; confirm on button click
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  const handleConfirm = useCallback(async () => {
    const pixelCrop = croppedAreaPixelsRef.current;
    if (!pixelCrop) return;

    setIsProcessing(true);
    try {
      const blob = await getCroppedBlob(imageUrl, pixelCrop, outputSize);
      onCropComplete(blob, { crop, zoom });
    } catch {
      // Silently ignore crop failure; user can retry
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, outputSize, onCropComplete, crop, zoom]);

  useScrollLock(true);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <ModalOverlay>
      <div
        ref={focusTrapRef}
        className={modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-cropper-title"
      >
        <div className={modalHeader}>
          <h3 id="image-cropper-title" className={modalTitle}>
            裁切圖片
          </h3>
        </div>

        <div className={cropWrapper}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className={zoomSliderWrap}>
          <input
            type="range"
            className={zoomSlider}
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="縮放"
          />
        </div>

        <div className={actionBar}>
          <div className={buttonGroup}>
            <button
              className={styledButton({ variant: 'secondary' })}
              onClick={onCancel}
              aria-label="取消裁切"
              disabled={isProcessing}
            >
              <span>取消</span>
            </button>
            <button
              className={styledButton({ variant: 'primary' })}
              onClick={handleConfirm}
              disabled={isProcessing}
              aria-label="確認裁切"
            >
              <span>{isProcessing ? '處理中...' : '確認裁切'}</span>
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
