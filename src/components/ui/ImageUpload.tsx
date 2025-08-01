'use client';

import { useState, useRef, useCallback } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { uploadImageToAPI, mockUpload, compressImage } from '@/lib/r2-upload';
import ImageCropper from './ImageCropper';

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
        const compressedFile = await compressImage(file);

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

        if (uploadResult.success && uploadResult.imageUrl) {
          onUploadComplete(uploadResult.imageUrl);
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
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver
            ? 'border-amber-400 bg-amber-50'
            : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">上傳中...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="預覽" className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute top-2 right-2 flex space-x-1">
              {/* 重新裁切按鈕（如果啟用裁切功能） */}
              {enableCrop && originalFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCropper(true);
                  }}
                  disabled={disabled}
                  className="bg-amber-500 text-white p-1 rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50"
                  title="重新裁切"
                >
                  <ScissorsIcon className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                title="移除圖片"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {enableCrop ? '點擊更換圖片或重新裁切' : '點擊更換圖片'}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <PhotoIcon className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
            <p className="text-xs text-gray-500">
              支援格式：{acceptedFormats.map((f) => f.split('/')[1]).join(', ')} • 最大 {maxSizeMB}
              MB
            </p>
            <div className="mt-3">
              <ArrowUpTrayIcon className="h-5 w-5 text-amber-600 mx-auto" />
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-2 text-xs text-gray-500">
        圖片會自動壓縮至適當大小以提升載入速度
        {enableCrop && ` • 支援${cropShape === 'circle' ? '圓形' : '方形'}裁切`}
      </p>

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
    </div>
  );
}
