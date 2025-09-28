'use client';

import { useState, useRef, useCallback } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { uploadImageToAPI, compressImage } from '@/lib/r2-upload';
import { CDN_DOMAIN } from '@/constants';
import styled from 'styled-components';
import showToast from '@/lib/toast';
import { css, cva } from '@/styled-system/css';
import Image from 'next/image';

const container = css({
  width: '100%',
});

const imageGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
});

const imageCard = css({
  position: 'relative',
  aspectRatio: '3/4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'color.background.secondary',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'color.border.medium',
  },
});

const imagePreview = css({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const actionButtonsContainer = css({
  position: 'absolute',
  inset: '0',
  background: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: '1',
  transition: 'opacity 0.2s ease',
  gap: '8px',
});

const actionButton = cva({
  base: {
    color: 'white',
    border: 'none',
    borderRadius: 'radius.circle',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      transform: 'scale(1.1)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      move: {
        background: 'rgba(0, 0, 0, 0.7)',
        '&:hover:not(:disabled)': {
          background: 'rgba(0, 0, 0, 0.9)',
        },
      },
      remove: {
        background: 'rgba(220, 53, 69, 0.9)',
        '&:hover:not(:disabled)': {
          background: 'rgba(220, 53, 69, 1)',
        },
      },
    },
  },
});

const OrderIndicator = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-light);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const UploadCard = styled.div<{ $disabled?: boolean }>`
  aspect-ratio: 1;
  border: 2px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  &:hover {
    border-color: ${(props) =>
      props.$disabled ? 'var(--color-border-light)' : 'var(--color-border-medium)'};
    background: ${(props) =>
      props.$disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg-tertiary)'};
  }
`;

const UploadIcon = styled(PlusIcon)`
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
`;

const UploadText = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin: 4px 0 0 0;
`;

const HelperText = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 8px 0 0 0;
`;

const hiddenInput = css({
  display: 'none',
});

interface MultiImageUploadProps {
  onImagesChange?: (imageUrls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  maxSizeMB?: number;
  placeholder?: string;
  disabled?: boolean;
  authToken?: string;
  // 壓縮參數
  compressionParams?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function MultiImageUpload({
  onImagesChange,
  currentImages = [],
  maxImages = 5,
  maxSizeMB = 5,
  placeholder = '點擊新增圖片',
  disabled = false,
  authToken,
  compressionParams = { maxWidth: 800, maxHeight: 800, quality: 0.8 }, // 預設值
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [loadingStates, setLoadingStates] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 驗證檔案
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedFormats.includes(file.type)) {
        return `不支援的檔案格式，請選擇：${acceptedFormats.join(', ')}`;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        return `檔案大小不能超過 ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedFormats, maxSizeMB]
  );

  // 上傳圖片
  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        // 使用自定義壓縮參數
        const compressedFile = await compressImage(
          file,
          compressionParams.maxWidth,
          compressionParams.maxHeight,
          compressionParams.quality
        );

        let uploadResult;
        if (authToken) {
          uploadResult = await uploadImageToAPI(compressedFile, authToken);
          if (uploadResult.success && uploadResult.filename) {
            return CDN_DOMAIN + uploadResult.filename;
          } else {
            throw new Error(uploadResult.error || '上傳失敗');
          }
        } else {
          throw new Error('請先登入');
        }
      } catch (error) {
        throw error;
      }
    },
    [authToken, compressionParams]
  );

  // 處理多檔案選擇
  const handleFilesSelect = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const filesArray = Array.from(files);
      const validFiles: File[] = [];

      // 檢查數量限制
      if (images.length + filesArray.length > maxImages) {
        showToast.error(`最多只能上傳 ${maxImages} 張圖片`);
        setError(`最多只能上傳 ${maxImages} 張圖片`);
        return;
      }

      // 驗證每個檔案
      for (const file of filesArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        validFiles.push(file);
      }

      // 上傳所有有效檔案
      const uploadPromises = validFiles.map(async (file, index) => {
        const loadingIndex = images.length + index;
        setLoadingStates((prev) => new Set([...prev, loadingIndex]));

        try {
          const imageUrl = await uploadImage(file);
          return imageUrl;
        } catch {
          return null;
        } finally {
          setLoadingStates((prev) => {
            const newSet = new Set(prev);
            newSet.delete(loadingIndex);
            return newSet;
          });
        }
      });

      try {
        const uploadedUrls = await Promise.all(uploadPromises);
        const successfulUploads = uploadedUrls.filter((url): url is string => url !== null);

        if (successfulUploads.length > 0) {
          const newImages = [...images, ...successfulUploads];
          setImages(newImages);
          onImagesChange?.(newImages);
        }

        if (successfulUploads.length < validFiles.length) {
          setError('部分圖片上傳失敗，請重試');
        }
      } catch {
        setError('圖片上傳失敗，請重試');
      }
    },
    [images, maxImages, validateFile, uploadImage, onImagesChange]
  );

  // 移除圖片
  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange?.(newImages);
      setError(null);
    },
    [images, onImagesChange]
  );

  // 處理檔案輸入變化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFilesSelect(files);
      }
    },
    [handleFilesSelect]
  );

  // 圖片順序調整功能
  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (disabled || fromIndex === toIndex || toIndex < 0 || toIndex >= images.length) return;

      const newImages = [...images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      setImages(newImages);
      onImagesChange?.(newImages);
    },
    [disabled, images, onImagesChange]
  );

  const moveImageLeft = useCallback(
    (index: number) => {
      moveImage(index, index - 1);
    },
    [moveImage]
  );

  const moveImageRight = useCallback(
    (index: number) => {
      moveImage(index, index + 1);
    },
    [moveImage]
  );

  const handleAddClick = useCallback(() => {
    if (!disabled && images.length < maxImages && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, images.length, maxImages]);

  const canAddMore = images.length < maxImages;
  const isAnyUploading = loadingStates.size > 0;

  return (
    <div className={container}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        disabled={disabled}
        multiple
        className={hiddenInput}
      />

      <div className={imageGrid}>
        {images.map((imageUrl, index) => (
          <div className={imageCard} key={index}>
            <Image src={imageUrl} alt={`詳細說明圖片 ${index + 1}`} className={imagePreview} fill />

            {/* 順序指示器 */}
            <OrderIndicator>{index + 1}</OrderIndicator>

            {/* 操作按鈕 */}
            <div className={actionButtonsContainer}>
              {/* 向左移動 */}
              {index > 0 && (
                <button
                  className={actionButton({ variant: 'move' })}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImageLeft(index);
                  }}
                  disabled={disabled}
                  title="向左移動"
                >
                  <ChevronLeftIcon width={16} height={16} />
                </button>
              )}

              {/* 移除按鈕 */}
              <button
                className={actionButton({ variant: 'remove' })}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                disabled={disabled}
                title="移除圖片"
              >
                <XMarkIcon />
              </button>

              {/* 向右移動 */}
              {index < images.length - 1 && (
                <button
                  className={actionButton({ variant: 'move' })}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImageRight(index);
                  }}
                  disabled={disabled}
                  title="向右移動"
                >
                  <ChevronRightIcon />
                </button>
              )}
            </div>

            {loadingStates.has(index) && (
              <LoadingOverlay>
                <LoadingSpinner />
              </LoadingOverlay>
            )}
          </div>
        ))}

        {canAddMore && (
          <UploadCard $disabled={disabled || isAnyUploading} onClick={handleAddClick}>
            {isAnyUploading ? (
              <>
                <LoadingSpinner />
                <UploadText>上傳中...</UploadText>
              </>
            ) : (
              <>
                <UploadIcon />
                <UploadText>{placeholder}</UploadText>
              </>
            )}
          </UploadCard>
        )}
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <HelperText>
        已上傳 {images.length}/{maxImages} 張圖片 • 支援格式：
        {acceptedFormats.map((f) => f.split('/')[1]).join(', ')} • 最大 {maxSizeMB}MB
        {images.length > 1 && ' • 點擊箭頭調整順序'}
      </HelperText>
    </div>
  );
}
