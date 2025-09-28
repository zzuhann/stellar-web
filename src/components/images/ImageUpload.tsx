'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { uploadImageToAPI, compressImage } from '@/lib/r2-upload';
import { CDN_DOMAIN } from '@/constants';
import ImageCropper from './ImageCropper';
import { css, cva } from '@/styled-system/css';
import Loading from '../Loading';
import Image from 'next/image';

const uploadContainer = css({
  width: '100%',
});

const uploadArea = cva({
  base: {
    position: 'relative',
    border: '2px dashed',
    borderRadius: 'radius.lg',
    padding: '24px',
    transition: 'all 0.2s ease',
    borderColor: 'color.border.light',
    background: 'color.background.primary',

    '@media (min-width: 768px)': {
      padding: '32px',
    },

    '&:hover': {
      borderColor: 'color.border.medium',
      background: 'color.background.secondary',
    },
  },
  variants: {
    hasError: {
      true: {
        borderColor: 'color.error !important',
        background: 'rgba(220, 53, 69, 0.05) !important',

        '&:hover': {
          borderColor: 'color.error !important',
          background: 'rgba(220, 53, 69, 0.05) !important',
        },
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: '0.5',
      },
      false: {
        cursor: 'pointer',
      },
    },
  },
  defaultVariants: {
    hasError: false,
    disabled: false,
  },
});

const hiddenInput = css({
  display: 'none',
});

const previewContainer = css({
  position: 'relative',
});

const previewImage = cva({
  base: {
    width: '100%',
    maxHeight: '192px',
    borderRadius: 'radius.lg',
    objectFit: 'contain',
    backgroundColor: 'color.background.secondary',
    aspectRatio: 'auto',
    maxWidth: '100%',
    margin: '0',
  },
  variants: {
    isCropped: {
      true: {
        borderRadius: 'radius.circle',
        objectFit: 'cover',
        backgroundColor: 'transparent',
        aspectRatio: '1',
        maxWidth: '192px',
        margin: '0 auto',
      },
    },
  },
});

const actionButtons = css({
  position: 'absolute',
  top: '8px',
  right: '8px',
  display: 'flex',
  gap: '4px',
});

const actionButton = cva({
  base: {
    padding: '4px',
    borderRadius: 'radius.circle',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      crop: {
        background: 'color.primary',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: '#2d4a5f',
        },
      },
      remove: {
        background: 'color.error',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: '#c82333',
        },
      },
    },
  },
});

const imageHint = css({
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  fontSize: '12px',
  padding: '4px 8px',
  borderRadius: 'radius.sm',
});

const uploadContent = css({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const uploadIcon = css({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '12px',
});

const uploadTitle = css({
  fontSize: '14px',
  color: 'color.text.primary',
  margin: '0 0 4px 0',
  '@media (min-width: 768px)': {
    fontSize: '15px',
  },
});

const uploadSubtitle = css({
  fontSize: '12px',
  color: 'color.text.secondary',
  margin: '0 0 12px 0',
  '@media (min-width: 768px)': {
    fontSize: '13px',
  },
});

const uploadArrow = css({
  marginTop: '12px',
});

const errorMessage = css({
  margin: '8px 0 0 0',
  fontSize: '13px',
  color: 'color.error',
});

const helperText = css({
  margin: '8px 0 0 0',
  fontSize: '12px',
  color: 'color.text.secondary',
  '@media (min-width: 768px)': {
    fontSize: '13px',
  },
});

interface ImageUploadProps {
  onImageRemove?: () => void;
  onUploadComplete?: (imageUrl: string) => void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  placeholder?: string;
  disabled?: boolean;
  authToken?: string;
  // 是否啟用裁切功能
  enableCrop?: boolean;
  // 裁切比例 (1 = 正方形)
  cropAspectRatio?: number;
  // 裁切輸出尺寸
  cropOutputSize?: number;
  // 裁切取消時的 callback
  onCropCancel?: () => void;
  // 是否只在 submit 時上傳
  delayUpload?: boolean;
  // 檔案準備好時的 callback(延遲上傳)
  onFileReady?: (file: File) => void;
  // 壓縮參數
  compressionParams?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ImageUpload({
  onImageRemove,
  onUploadComplete,
  currentImageUrl,
  maxSizeMB = 5,
  placeholder = '點擊上傳圖片',
  disabled = false,
  authToken,
  enableCrop = false,
  cropAspectRatio = 1,
  cropOutputSize = 400,
  onCropCancel,
  delayUpload = false,
  onFileReady,
  compressionParams = { maxWidth: 800, maxHeight: 800, quality: 0.8 },
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [lastCropArea, setLastCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [hasCroppedImage, setHasCroppedImage] = useState(false);
  const [confirmedImageUrl, setConfirmedImageUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `不支援上傳的檔案格式，請選擇：${acceptedFormats.join(', ')}`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `檔案大小不能超過 ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // 使用自定義壓縮參數
      const compressedFile = await compressImage(
        file,
        compressionParams.maxWidth,
        compressionParams.maxHeight,
        compressionParams.quality
      );

      // 如果啟用裁切功能，保存原始檔案並顯示裁切器
      if (enableCrop) {
        setOriginalFile(compressedFile);
        // 選擇新圖片時重置裁切範圍，回到居中位置
        setLastCropArea(null);
        setShowCropper(true);
        return; // 暫停，等待裁切完成，不要立即更新預覽
      }

      // 只有在不需要裁切時才立即更新預覽
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);

      if (delayUpload) {
        // 延遲上傳模式：只保存檔案，不立即上傳
        onFileReady?.(compressedFile);
      } else {
        // 立即上傳模式：直接上傳
        await uploadImage(compressedFile);
      }
    } catch {
      setError('圖片處理失敗，請重試');
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!onUploadComplete) return;

    setIsLoading(true);

    try {
      let uploadResult;
      if (authToken) {
        uploadResult = await uploadImageToAPI(file, authToken);
        if (uploadResult.success && uploadResult.filename) {
          const fullImageUrl = CDN_DOMAIN + uploadResult.filename;
          setConfirmedImageUrl(fullImageUrl);
          onUploadComplete(fullImageUrl);
        } else {
          setError(uploadResult.error || '上傳失敗');
        }
      } else {
        setError('請先登入');
      }
    } catch {
      setError('上傳失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropComplete = async (
    croppedBlob: Blob,
    cropArea?: { x: number; y: number; width: number; height: number }
  ) => {
    // 保存裁切區域，用於下次重新裁切時維持範圍
    if (cropArea) {
      setLastCropArea(cropArea);
    }

    // 將 Blob 轉換為 File
    const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    // 更新預覽
    const url = URL.createObjectURL(croppedBlob);
    setPreviewUrl(url);
    setConfirmedImageUrl(url); // 保存確認的圖片URL

    // 關閉裁切器
    setShowCropper(false);

    // 標記已經裁切過圖片
    setHasCroppedImage(true);

    if (delayUpload) {
      // 延遲上傳模式：只保存檔案，不立即上傳
      onFileReady?.(croppedFile);
    } else {
      // 立即上傳模式：直接上傳
      await uploadImage(croppedFile);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);

    // 取消裁切時不重置裁切範圍，保持給下次重新裁切使用
    // setLastCropArea 保持不變

    // 如果還沒裁切過圖片，則清空所有狀態（第一次上傳時取消）
    if (!hasCroppedImage) {
      setPreviewUrl(null);
      setOriginalFile(null);
      setConfirmedImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      // 如果已經裁切過，恢復到之前確認的圖片
      setPreviewUrl(confirmedImageUrl);
    }
    // 呼叫外部傳入的取消回調
    onCropCancel?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    setHasCroppedImage(false); // 重置裁切狀態
    setConfirmedImageUrl(null); // 重置確認的圖片URL
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  // 點擊上傳區域
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={uploadContainer}>
      <div className={uploadArea({ hasError: !!error, disabled })} onClick={handleClick}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className={hiddenInput}
        />

        {isLoading ? (
          <Loading description="上傳中..." />
        ) : previewUrl ? (
          <div className={previewContainer}>
            <Image
              className={previewImage({ isCropped: enableCrop && hasCroppedImage })}
              src={previewUrl}
              alt="預覽"
              width={0}
              height={0}
            />
            <div className={actionButtons}>
              {/* 重新裁切按鈕（如果啟用裁切功能） */}
              {enableCrop && originalFile && (
                <button
                  className={actionButton({ variant: 'crop' })}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCropper(true);
                  }}
                  disabled={disabled}
                  title="重新裁切"
                >
                  <ScissorsIcon style={{ width: '16px', height: '16px' }} />
                </button>
              )}
              <button
                className={actionButton({ variant: 'remove' })}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
                title="移除圖片"
              >
                <XMarkIcon style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div className={imageHint}>
              {enableCrop ? '可更換圖片或重新選擇裁切範圍' : '點擊更換圖片'}
            </div>
          </div>
        ) : (
          <div className={uploadContent}>
            <div className={uploadIcon}>
              <PhotoIcon width={48} height={48} color="var(--color-text-secondary)" />
            </div>
            <p className={uploadTitle}>{placeholder}</p>
            <p className={uploadSubtitle}>
              支援格式：{acceptedFormats.map((f) => f.split('/')[1]).join(', ')} • 最大 {maxSizeMB}
              MB
            </p>
            <div className={uploadArrow}>
              <ArrowUpTrayIcon width={20} height={20} color="var(--color-primary)" />
            </div>
          </div>
        )}
      </div>

      {error && <p className={errorMessage}>{error}</p>}

      <p className={helperText}>
        圖片會自動壓縮至適當大小
        {enableCrop && ` • 支援圓形裁切`}
      </p>

      {showCropper && originalFile && (
        <ImageCropper
          imageUrl={URL.createObjectURL(originalFile)}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={cropAspectRatio}
          outputSize={cropOutputSize}
          initialCropArea={lastCropArea}
        />
      )}
    </div>
  );
}
