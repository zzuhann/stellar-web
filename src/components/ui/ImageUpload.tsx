'use client';

import { useState, useRef, useCallback } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { uploadImageToAPI, mockUpload, compressImage } from '@/lib/r2-upload';
import { CDN_DOMAIN } from '@/constants';
import ImageCropper from './ImageCropper';
import styled from 'styled-components';

interface ImageUploadProps {
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  onUploadComplete?: (imageUrl: string) => void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  placeholder?: string;
  disabled?: boolean;
  authToken?: string;
  useRealAPI?: boolean;
  // 新增裁切功能相關屬性
  enableCrop?: boolean; // 是否啟用裁切功能
  cropAspectRatio?: number; // 裁切比例，1 = 正方形
  cropShape?: 'square' | 'circle'; // 裁切形狀
  cropOutputSize?: number; // 輸出尺寸
}

// Styled Components
const UploadContainer = styled.div`
  width: 100%;
`;

const UploadArea = styled.div<{
  isDragOver: boolean;
  hasError: boolean;
  disabled: boolean;
}>`
  position: relative;
  border: 2px dashed;
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: all 0.2s ease;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  ${(props) =>
    props.isDragOver
      ? `
    border-color: var(--color-primary);
    background: var(--color-accent);
  `
      : props.hasError
        ? `
    border-color: var(--color-error);
    background: rgba(220, 53, 69, 0.05);
  `
        : `
    border-color: var(--color-border-light);
    background: var(--color-bg-primary);

    &:hover {
      border-color: var(--color-border-medium);
      background: var(--color-bg-secondary);
    }
  `}

  @media (min-width: 768px) {
    padding: 32px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingContainer = styled.div`
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const PreviewContainer = styled.div`
  position: relative;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 192px;
  border-radius: var(--radius-lg);
  object-fit: contain;
  background-color: var(--color-bg-secondary);
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button<{ variant: 'crop' | 'remove' }>`
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.variant === 'crop'
      ? `
    background: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background: #2d4a5f;
    }
  `
      : `
    background: var(--color-error);
    color: white;

    &:hover:not(:disabled) {
      background: #c82333;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImageHint = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
`;

const UploadContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const UploadTitle = styled.p`
  font-size: 14px;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const UploadSubtitle = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 12px 0;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

const UploadArrow = styled.div`
  margin-top: 12px;
`;

const ErrorMessage = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  color: var(--color-error);
`;

const HelperText = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  onUploadComplete,
  currentImageUrl,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  placeholder = '點擊上傳圖片或拖拽至此',
  disabled = false,
  authToken,
  useRealAPI = false,
  enableCrop = false,
  cropAspectRatio = 1,
  cropShape = 'square',
  cropOutputSize = 400,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
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

  // 處理檔案選擇和上傳
  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        // 壓縮圖片
        const compressedFile = await compressImage(file, 800, 800, 0.8);

        // 產生預覽
        const url = URL.createObjectURL(compressedFile);
        setPreviewUrl(url);

        // 通知父組件檔案已選擇
        onImageSelect?.(compressedFile);

        // 如果啟用裁切功能，保存原始檔案並顯示裁切器
        if (enableCrop) {
          setOriginalFile(compressedFile);
          setShowCropper(true);
          return; // 暫停，等待裁切完成
        }

        // 直接上傳（沒有裁切）
        await uploadImage(compressedFile);
      } catch {
        setError('圖片處理失敗，請重試');
        setIsLoading(false);
      }
    },
    [validateFile, enableCrop, onImageSelect]
  );

  // 上傳圖片的共用函數
  const uploadImage = useCallback(
    async (file: File) => {
      if (!onUploadComplete) return;

      setIsLoading(true);

      try {
        let uploadResult;
        if (useRealAPI && authToken) {
          uploadResult = await uploadImageToAPI(file, authToken);
        } else {
          uploadResult = await mockUpload(file);
        }

        if (uploadResult.success && uploadResult.filename) {
          const fullImageUrl = CDN_DOMAIN + uploadResult.filename;
          onUploadComplete(fullImageUrl);
        } else {
          setError(uploadResult.error || '上傳失敗');
        }
      } catch {
        setError('上傳失敗，請重試');
      } finally {
        setIsLoading(false);
      }
    },
    [onUploadComplete, useRealAPI, authToken]
  );

  // 處理裁切完成
  const handleCropComplete = useCallback(
    async (croppedBlob: Blob) => {
      // 將 Blob 轉換為 File
      const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // 更新預覽
      const url = URL.createObjectURL(croppedBlob);
      setPreviewUrl(url);

      // 關閉裁切器
      setShowCropper(false);

      // 上傳裁切後的圖片
      await uploadImage(croppedFile);
    },
    [uploadImage]
  );

  // 取消裁切
  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setOriginalFile(null);
    setPreviewUrl(null);
  }, []);

  // 處理檔案輸入變化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // 處理拖拽
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith('image/'));

      if (imageFile) {
        handleFileSelect(imageFile);
      }
    },
    [disabled, handleFileSelect]
  );

  // 移除圖片
  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  }, [onImageRemove]);

  // 點擊上傳區域
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <UploadContainer>
      <UploadArea
        isDragOver={isDragOver}
        hasError={!!error}
        disabled={disabled}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>上傳中...</LoadingText>
          </LoadingContainer>
        ) : previewUrl ? (
          <PreviewContainer>
            <PreviewImage src={previewUrl} alt="預覽" />
            <ActionButtons>
              {/* 重新裁切按鈕（如果啟用裁切功能） */}
              {enableCrop && originalFile && (
                <ActionButton
                  type="button"
                  variant="crop"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCropper(true);
                  }}
                  disabled={disabled}
                  title="重新裁切"
                >
                  <ScissorsIcon className="h-4 w-4" />
                </ActionButton>
              )}
              <ActionButton
                type="button"
                variant="remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
                title="移除圖片"
              >
                <XMarkIcon className="h-4 w-4" />
              </ActionButton>
            </ActionButtons>
            <ImageHint>{enableCrop ? '點擊更換圖片或重新裁切' : '點擊更換圖片'}</ImageHint>
          </PreviewContainer>
        ) : (
          <UploadContent>
            <UploadIcon>
              <PhotoIcon className="h-12 w-12" style={{ color: 'var(--color-text-secondary)' }} />
            </UploadIcon>
            <UploadTitle>{placeholder}</UploadTitle>
            <UploadSubtitle>
              支援格式：{acceptedFormats.map((f) => f.split('/')[1]).join(', ')} • 最大 {maxSizeMB}
              MB
            </UploadSubtitle>
            <UploadArrow>
              <ArrowUpTrayIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            </UploadArrow>
          </UploadContent>
        )}
      </UploadArea>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <HelperText>
        圖片會自動壓縮至適當大小以提升載入速度
        {enableCrop && ` • 支援${cropShape === 'circle' ? '圓形' : '方形'}裁切`}
      </HelperText>

      {/* 圖片裁切器 */}
      {showCropper && originalFile && (
        <ImageCropper
          imageUrl={URL.createObjectURL(originalFile)}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={cropAspectRatio}
          cropShape={cropShape}
          outputSize={cropOutputSize}
        />
      )}
    </UploadContainer>
  );
}
