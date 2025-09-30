'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useScrollLock } from '@/hooks/useScrollLock';
import ModalOverlay from './ModalOverlay';
import { css, cva } from '@/styled-system/css';
import Image from 'next/image';

const modalContainer = css({
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  padding: '20px',
  maxWidth: '500px',
  width: '100%',
  margin: '16px',
  maxHeight: '90vh',
  overflowY: 'auto',
  '@media (min-width: 768px)': {
    padding: '24px',
    maxWidth: '520px',
  },
});

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0',
  '@media (min-width: 768px)': {
    fontSize: '20px',
  },
});

const cropContainer = css({
  position: 'relative',
  margin: '0 auto',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'none',
});

const cropImage = css({
  position: 'absolute',
  maxWidth: 'none',
  maxHeight: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
  pointerEvents: 'none',
});

const cropOverlay = css({
  position: 'absolute',
  background: 'rgba(0, 0, 0, 0.4)',
});

const cropFrame = cva({
  base: {
    position: 'absolute',
    border: '2px solid',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
    borderRadius: 'radius.circle',
  },
  variants: {
    isDragging: {
      true: {
        cursor: 'grabbing',
      },
      false: {
        cursor: 'grab',
      },
    },
    isResizing: {
      true: {
        cursor: 'resize',
      },
      false: {
        cursor: 'grab',
      },
    },
  },
});

const styledResizeHandle = css({
  position: 'absolute',
  width: '20px',
  height: '20px',
  background: 'color.primary',
  border: '2px solid',
  borderColor: 'white',
  borderRadius: 'radius.circle',
  transform: 'translate(-50%, -50%)',
  '@media (max-width: 768px)': {
    width: '24px',
    height: '24px',
  },
});

const actionBar = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '24px',
});

const buttonGroup = css({
  display: 'flex',
  gap: '12px',
});

const styledButton = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: 'radius.lg',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    '@media (min-width: 768px)': {
      padding: '14px 18px',
      fontSize: '15px',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'color.primary',
        borderColor: 'color.primary',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: '#3a5d7a',
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

const hiddenCanvas = css({
  display: 'none',
});

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob, cropArea?: CropArea) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 = 正方形, 16/9 = 寬螢幕等
  outputSize?: number; // 輸出尺寸（正方形的邊長）
  initialCropArea?: CropArea | null; // 初始裁切區域
}

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // 預設正方形
  outputSize = 400,
  initialCropArea = null,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>(''); // 'nw', 'ne', 'sw', 'se'
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 圖片載入後設定初始裁切區域
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    // 動態計算容器大小，根據螢幕大小調整
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const maxContainerSize = isMobile ? Math.min(280, window.innerWidth - 80) : 400;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    let containerWidth, containerHeight;
    let displayWidth, displayHeight;

    if (imgRatio > 1) {
      // 圖片較寬
      containerWidth = maxContainerSize;
      containerHeight = maxContainerSize / imgRatio;
      displayWidth = containerWidth;
      displayHeight = containerHeight;
    } else {
      // 圖片較高或正方形
      containerHeight = maxContainerSize;
      containerWidth = maxContainerSize * imgRatio;
      displayWidth = containerWidth;
      displayHeight = containerHeight;
    }

    setImageSize({ width: displayWidth, height: displayHeight });
    setContainerSize({ width: containerWidth, height: containerHeight });

    // 設定初始裁切區域
    if (initialCropArea) {
      // 如果有之前的裁切區域，使用它
      setCropArea(initialCropArea);
    } else {
      // 否則使用預設的居中裁切區域
      const minSize = Math.min(displayWidth, displayHeight) * 0.6;
      const size = aspectRatio === 1 ? minSize : Math.min(minSize, minSize / aspectRatio);

      setCropArea({
        x: (displayWidth - size) / 2,
        y: (displayHeight - size) / 2,
        width: size,
        height: size / aspectRatio,
      });
    }

    setImageLoaded(true);
  }, [aspectRatio, initialCropArea]);

  // 圖片的實際邊界
  const getImageBounds = useCallback(() => {
    return {
      left: 0,
      top: 0,
      right: imageSize.width,
      bottom: imageSize.height,
      width: imageSize.width,
      height: imageSize.height,
    };
  }, [imageSize]);

  // 檢查是否點擊在調整大小的控制點上
  const getResizeHandle = useCallback(
    (x: number, y: number) => {
      const handleSize = typeof window !== 'undefined' && window.innerWidth <= 768 ? 12 : 10; // 手機上使用更大的檢測範圍
      const { x: cropX, y: cropY, width, height } = cropArea;

      // 檢查四個角落
      if (Math.abs(x - cropX) <= handleSize && Math.abs(y - cropY) <= handleSize) {
        return 'nw'; // 西北角
      }
      if (Math.abs(x - (cropX + width)) <= handleSize && Math.abs(y - cropY) <= handleSize) {
        return 'ne'; // 東北角
      }
      if (Math.abs(x - cropX) <= handleSize && Math.abs(y - (cropY + height)) <= handleSize) {
        return 'sw'; // 西南角
      }
      if (
        Math.abs(x - (cropX + width)) <= handleSize &&
        Math.abs(y - (cropY + height)) <= handleSize
      ) {
        return 'se'; // 東南角
      }

      return '';
    },
    [cropArea]
  );

  // 處理拖曳事件（滑鼠和觸控）
  const handlePointerDown = useCallback(
    (e: React.PointerEvent | React.MouseEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = 'clientX' in e ? e.clientX : (e as any).touches?.[0]?.clientX || 0;
      const clientY = 'clientY' in e ? e.clientY : (e as any).touches?.[0]?.clientY || 0;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 檢查是否點擊在調整大小的控制點上
      const handle = getResizeHandle(x, y);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x, y });
        return;
      }

      // 檢查是否點擊在裁切區域內（移動）
      if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      }
    },
    [cropArea, getResizeHandle]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging && !isResizing) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const imageBounds = getImageBounds();

      if (isResizing) {
        // 調整大小邏輯 - 降低敏感度讓調整更平順
        const deltaX = (x - dragStart.x) * 0.8; // 降低80%敏感度
        const minSize = 50; // 最小裁切框大小

        setCropArea((prev) => {
          const newCrop = { ...prev };

          switch (resizeHandle) {
            case 'se': // 東南角
              // 限制寬度不超過右邊界和底邊界
              const maxWidthSE = imageBounds.right - prev.x;
              const maxHeightSE = imageBounds.bottom - prev.y;
              const maxSizeSE =
                aspectRatio === 1
                  ? Math.min(maxWidthSE, maxHeightSE)
                  : Math.min(maxWidthSE, maxHeightSE * aspectRatio);

              newCrop.width = Math.max(minSize, Math.min(maxSizeSE, prev.width + deltaX));
              newCrop.height = aspectRatio === 1 ? newCrop.width : newCrop.width / aspectRatio;
              break;
            case 'sw': // 西南角
              const maxWidthSW = prev.x + prev.width - imageBounds.left;
              const maxHeightSW = imageBounds.bottom - prev.y;
              const maxSizeSW =
                aspectRatio === 1
                  ? Math.min(maxWidthSW, maxHeightSW)
                  : Math.min(maxWidthSW, maxHeightSW * aspectRatio);

              const newWidthSW = Math.max(minSize, Math.min(maxSizeSW, prev.width - deltaX));
              newCrop.width = newWidthSW;
              newCrop.height = aspectRatio === 1 ? newWidthSW : newWidthSW / aspectRatio;
              newCrop.x = prev.x + prev.width - newWidthSW;
              break;
            case 'ne': // 東北角
              const maxWidthNE = imageBounds.right - prev.x;
              const maxHeightNE = prev.y + prev.height - imageBounds.top;
              const maxSizeNE =
                aspectRatio === 1
                  ? Math.min(maxWidthNE, maxHeightNE)
                  : Math.min(maxWidthNE, maxHeightNE * aspectRatio);

              const newWidthNE = Math.max(minSize, Math.min(maxSizeNE, prev.width + deltaX));
              const newHeightNE = aspectRatio === 1 ? newWidthNE : newWidthNE / aspectRatio;
              newCrop.width = newWidthNE;
              newCrop.height = newHeightNE;
              newCrop.y = prev.y + prev.height - newHeightNE;
              break;
            case 'nw': // 西北角
              const maxWidthNW = prev.x + prev.width - imageBounds.left;
              const maxHeightNW = prev.y + prev.height - imageBounds.top;
              const maxSizeNW =
                aspectRatio === 1
                  ? Math.min(maxWidthNW, maxHeightNW)
                  : Math.min(maxWidthNW, maxHeightNW * aspectRatio);

              const newWidthNW = Math.max(minSize, Math.min(maxSizeNW, prev.width - deltaX));
              const newHeightNW = aspectRatio === 1 ? newWidthNW : newWidthNW / aspectRatio;
              newCrop.width = newWidthNW;
              newCrop.height = newHeightNW;
              newCrop.x = prev.x + prev.width - newWidthNW;
              newCrop.y = prev.y + prev.height - newHeightNW;
              break;
          }

          return newCrop;
        });

        setDragStart({ x, y });
      } else if (isDragging) {
        // 移動邏輯
        const newX = x - dragStart.x;
        const newY = y - dragStart.y;

        // 限制裁切區域在圖片範圍內
        const maxX = imageBounds.right - cropArea.width;
        const maxY = imageBounds.bottom - cropArea.height;

        setCropArea((prev) => ({
          ...prev,
          x: Math.max(imageBounds.left, Math.min(maxX, newX)),
          y: Math.max(imageBounds.top, Math.min(maxY, newY)),
        }));
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      getImageBounds,
      cropArea.width,
      cropArea.height,
      resizeHandle,
      aspectRatio,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // 防止上下文菜單（右鍵菜單、長按菜單）
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // 使用 useScrollLock hook 防止背景滾動
  useScrollLock(true);

  // 防止選擇事件
  React.useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // 監聽選擇開始事件
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);

    return () => {
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
    };
  }, []);

  // 處理觸控事件的 passive: false 配置
  const cropContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = cropContainerRef.current;
    if (!container) return;

    const handleTouchMovePassive = (e: TouchEvent) => {
      if (!isDragging && !isResizing) return;
      if (e.touches.length !== 1) return;

      e.preventDefault();
      // 觸發 React 事件處理邏輯
      const rect = container.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      const imageBounds = getImageBounds();

      if (isResizing) {
        // 調整大小邏輯 - 降低敏感度讓調整更平順
        const deltaX = (x - dragStart.x) * 0.8; // 降低80%敏感度
        const minSize = 50;

        setCropArea((prev) => {
          const newCrop = { ...prev };

          switch (resizeHandle) {
            case 'se':
              const maxWidthSE = imageBounds.right - prev.x;
              const maxHeightSE = imageBounds.bottom - prev.y;
              const maxSizeSE =
                aspectRatio === 1
                  ? Math.min(maxWidthSE, maxHeightSE)
                  : Math.min(maxWidthSE, maxHeightSE * aspectRatio);

              newCrop.width = Math.max(minSize, Math.min(maxSizeSE, prev.width + deltaX));
              newCrop.height = aspectRatio === 1 ? newCrop.width : newCrop.width / aspectRatio;
              break;
            case 'sw':
              const maxWidthSW = prev.x + prev.width - imageBounds.left;
              const maxHeightSW = imageBounds.bottom - prev.y;
              const maxSizeSW =
                aspectRatio === 1
                  ? Math.min(maxWidthSW, maxHeightSW)
                  : Math.min(maxWidthSW, maxHeightSW * aspectRatio);

              const newWidthSW = Math.max(minSize, Math.min(maxSizeSW, prev.width - deltaX));
              newCrop.width = newWidthSW;
              newCrop.height = aspectRatio === 1 ? newWidthSW : newWidthSW / aspectRatio;
              newCrop.x = prev.x + prev.width - newWidthSW;
              break;
            case 'ne':
              const maxWidthNE = imageBounds.right - prev.x;
              const maxHeightNE = prev.y + prev.height - imageBounds.top;
              const maxSizeNE =
                aspectRatio === 1
                  ? Math.min(maxWidthNE, maxHeightNE)
                  : Math.min(maxWidthNE, maxHeightNE * aspectRatio);

              const newWidthNE = Math.max(minSize, Math.min(maxSizeNE, prev.width + deltaX));
              const newHeightNE = aspectRatio === 1 ? newWidthNE : newWidthNE / aspectRatio;
              newCrop.width = newWidthNE;
              newCrop.height = newHeightNE;
              newCrop.y = prev.y + prev.height - newHeightNE;
              break;
            case 'nw':
              const maxWidthNW = prev.x + prev.width - imageBounds.left;
              const maxHeightNW = prev.y + prev.height - imageBounds.top;
              const maxSizeNW =
                aspectRatio === 1
                  ? Math.min(maxWidthNW, maxHeightNW)
                  : Math.min(maxWidthNW, maxHeightNW * aspectRatio);

              const newWidthNW = Math.max(minSize, Math.min(maxSizeNW, prev.width - deltaX));
              const newHeightNW = aspectRatio === 1 ? newWidthNW : newWidthNW / aspectRatio;
              newCrop.width = newWidthNW;
              newCrop.height = newHeightNW;
              newCrop.x = prev.x + prev.width - newWidthNW;
              newCrop.y = prev.y + prev.height - newHeightNW;
              break;
          }

          return newCrop;
        });

        setDragStart({ x, y });
      } else if (isDragging) {
        const newX = x - dragStart.x;
        const newY = y - dragStart.y;

        const maxX = imageBounds.right - cropArea.width;
        const maxY = imageBounds.bottom - cropArea.height;

        setCropArea((prev) => ({
          ...prev,
          x: Math.max(imageBounds.left, Math.min(maxX, newX)),
          y: Math.max(imageBounds.top, Math.min(maxY, newY)),
        }));
      }
    };

    const handleTouchStartPassive = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const rect = container.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;

        const handle = getResizeHandle(x, y);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragStart({ x, y });
          return;
        }

        if (
          x >= cropArea.x &&
          x <= cropArea.x + cropArea.width &&
          y >= cropArea.y &&
          y <= cropArea.y + cropArea.height
        ) {
          setIsDragging(true);
          setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
        }
      }
    };

    const handleTouchEndPassive = (e: TouchEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle('');
    };

    container.addEventListener('touchstart', handleTouchStartPassive, { passive: false });
    container.addEventListener('touchmove', handleTouchMovePassive, { passive: false });
    container.addEventListener('touchend', handleTouchEndPassive, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStartPassive);
      container.removeEventListener('touchmove', handleTouchMovePassive);
      container.removeEventListener('touchend', handleTouchEndPassive);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    getImageBounds,
    cropArea,
    resizeHandle,
    aspectRatio,
    getResizeHandle,
  ]);

  // 執行裁切
  const handleCrop = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas || !imageLoaded) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 設定輸出畫布大小 - 始終輸出方形圖片
      canvas.width = outputSize;
      canvas.height = outputSize;

      // 計算縮放比例
      const scaleX = img.naturalWidth / imageSize.width;
      const scaleY = img.naturalHeight / imageSize.height;

      // 計算實際裁切區域 - 確保是方形區域
      const sourceX = Math.max(0, cropArea.x * scaleX);
      const sourceY = Math.max(0, cropArea.y * scaleY);
      const sourceWidth = cropArea.width * scaleX;
      const sourceHeight = cropArea.height * scaleY;

      // 取方形區域的最小邊長，確保裁切區域是正方形
      const squareSize = Math.min(sourceWidth, sourceHeight);
      const adjustedSourceX = sourceX + (sourceWidth - squareSize) / 2;
      const adjustedSourceY = sourceY + (sourceHeight - squareSize) / 2;

      // 注意：即使顯示為圓形，實際裁切輸出仍然是方形
      // 圓形效果通過 CSS 在前端實現

      // 繪製裁切後的圖片 - 輸出方形
      ctx.drawImage(
        img,
        adjustedSourceX,
        adjustedSourceY,
        squareSize,
        squareSize,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 轉換為 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // 傳遞當前的裁切區域給回調函數
            onCropComplete(blob, cropArea);
          }
        },
        'image/jpeg',
        0.9
      );
    },
    [imageLoaded, cropArea, imageSize, outputSize, onCropComplete]
  );

  return (
    <ModalOverlay>
      <div className={modalContainer}>
        <div className={modalHeader}>
          <h3 className={modalTitle}>裁切圖片</h3>
        </div>

        {/* 裁切區域 */}
        <div
          className={cropContainer}
          ref={cropContainerRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
          style={{ width: `${containerSize.width}px`, height: `${containerSize.height}px` }}
        >
          <Image
            className={cropImage}
            ref={imageRef}
            src={imageUrl}
            alt="待裁切圖片"
            width={imageSize.width}
            height={imageSize.height}
            onLoad={handleImageLoad}
            onContextMenu={handleContextMenu}
            draggable={false}
            style={{ left: '0px', top: '0px' }}
          />

          {/* 裁切框遮罩 */}
          {imageLoaded && (
            <>
              {/* 暗化區域 - 上方 */}
              <div
                className={cropOverlay}
                style={{
                  left: '0px',
                  top: '0px',
                  width: `${containerSize.width}px`,
                  height: `${cropArea.y}px`,
                }}
              />
              {/* 暗化區域 - 下方 */}
              <div
                className={cropOverlay}
                style={{
                  left: '0px',
                  top: `${cropArea.y + cropArea.height}px`,
                  width: `${containerSize.width}px`,
                  height: `${containerSize.height - (cropArea.y + cropArea.height)}px`,
                }}
              />
              {/* 暗化區域 - 左側 */}
              <div
                className={cropOverlay}
                style={{
                  left: '0px',
                  top: `${cropArea.y}px`,
                  width: `${cropArea.x}px`,
                  height: `${cropArea.height}px`,
                }}
              />
              {/* 暗化區域 - 右側 */}
              <div
                className={cropOverlay}
                style={{
                  left: `${cropArea.x + cropArea.width}px`,
                  top: `${cropArea.y}px`,
                  width: `${containerSize.width - (cropArea.x + cropArea.width)}px`,
                  height: `${cropArea.height}px`,
                }}
              />

              {/* 裁切框邊界 */}
              <div
                className={cropFrame({
                  isDragging,
                  isResizing,
                })}
                style={{
                  left: `${cropArea.x}px`,
                  top: `${cropArea.y}px`,
                  width: `${cropArea.width}px`,
                  height: `${cropArea.height}px`,
                }}
              />

              {/* 調整大小的控制點 - 圓形和方形都顯示 */}
              <>
                {/* 西北角 */}
                <div
                  className={styledResizeHandle}
                  style={{ left: `${cropArea.x}px`, top: `${cropArea.y}px`, cursor: 'nw-resize' }}
                />
                {/* 東北角 */}
                <div
                  className={styledResizeHandle}
                  style={{
                    left: `${cropArea.x + cropArea.width}px`,
                    top: `${cropArea.y}px`,
                    cursor: 'ne-resize',
                  }}
                />
                {/* 西南角 */}
                <div
                  className={styledResizeHandle}
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y + cropArea.height}px`,
                    cursor: 'sw-resize',
                  }}
                />
                {/* 東南角 */}
                <div
                  className={styledResizeHandle}
                  style={{
                    left: `${cropArea.x + cropArea.width}px`,
                    top: `${cropArea.y + cropArea.height}px`,
                    cursor: 'se-resize',
                  }}
                />
              </>
            </>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className={actionBar}>
          <div className={buttonGroup}>
            <button className={styledButton({ variant: 'secondary' })} onClick={onCancel}>
              <XMarkIcon style={{ width: '16px', height: '16px' }} />
              <span>取消</span>
            </button>
            <button
              className={styledButton({ variant: 'primary' })}
              onClick={handleCrop}
              disabled={!imageLoaded}
            >
              <CheckIcon style={{ width: '16px', height: '16px' }} />
              <span>確認裁切</span>
            </button>
          </div>
        </div>

        {/* 隱藏的畫布用於裁切 */}
        <canvas className={hiddenCanvas} ref={canvasRef} />
      </div>
    </ModalOverlay>
  );
}
