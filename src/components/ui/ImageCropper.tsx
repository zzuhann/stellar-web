'use client';

import { useState, useRef, useCallback } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';
import styled from 'styled-components';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 = 正方形, 16/9 = 寬螢幕等
  cropShape?: 'square' | 'circle'; // 裁切形狀
  outputSize?: number; // 輸出尺寸（正方形的邊長）
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContainer = styled.div`
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 20px;
  max-width: 500px;
  width: 100%;
  margin: 16px;
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 768px) {
    padding: 24px;
    max-width: 520px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const ZoomControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const ZoomButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 14px;

  &:hover:not(:disabled) {
    background: var(--color-bg-muted);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 10px 14px;
    font-size: 15px;
  }
`;

const ZoomDisplay = styled.div`
  font-size: 14px;
  min-width: 80px;
  text-align: center;
  color: var(--color-text-secondary);

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const CropContainer = styled.div<{ width: number; height: number }>`
  position: relative;
  margin: 0 auto;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const CropImage = styled.img<{
  width: number;
  height: number;
  left: number;
  top: number;
}>`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  max-width: none;
  max-height: none;
`;

const CropOverlay = styled.div<{
  left: number;
  top: number;
  width: number;
  height: number;
}>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background: rgba(0, 0, 0, 0.4);
`;

const CropFrame = styled.div<{
  left: number;
  top: number;
  width: number;
  height: number;
  isCircle?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
}>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border: 2px solid var(--color-primary);
  border-radius: ${(props) => (props.isCircle ? '50%' : '0')};
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  cursor: ${(props) => (props.isDragging ? 'grabbing' : props.isResizing ? 'resize' : 'grab')};
`;

const ResizeHandle = styled.div<{
  left: number;
  top: number;
  cursor: string;
}>`
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  cursor: ${(props) => props.cursor};

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
`;

const GridLine = styled.div<{
  left?: string;
  top?: string;
  width?: string;
  height?: string;
  isVertical?: boolean;
}>`
  position: absolute;
  width: ${(props) => (props.isVertical ? '1px' : props.width || '100%')};
  height: ${(props) => (props.isVertical ? props.height || '100%' : '1px')};
  background: white;
  opacity: 0.5;
  left: ${(props) => props.left || '0'};
  top: ${(props) => props.top || '0'};
  pointer-events: none;
`;

const GridContainer = styled.div<{
  left: number;
  top: number;
  width: number;
  height: number;
}>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  pointer-events: none;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background: #2d4a5f;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `
      : `
    background: var(--color-bg-primary);
    border-color: var(--color-border-light);
    color: var(--color-text-primary);

    &:hover {
      background: var(--color-bg-secondary);
    }
  `}

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const HiddenCanvas = styled.canvas`
  display: none;
`;

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // 預設正方形
  cropShape = 'square',
  outputSize = 400,
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
  const [zoom, setZoom] = useState(1); // 縮放比例
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 }); // 圖片位置

  // 圖片載入後設定初始裁切區域
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    // 動態計算容器大小，最大400px
    const maxContainerSize = 400;
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

    // 圖片位置設為 (0,0)，填滿整個容器
    setImagePosition({ x: 0, y: 0 });

    // 設定初始裁切區域（居中）
    const minSize = Math.min(displayWidth, displayHeight) * 0.6;
    const size = aspectRatio === 1 ? minSize : Math.min(minSize, minSize / aspectRatio);

    setCropArea({
      x: (displayWidth - size) / 2,
      y: (displayHeight - size) / 2,
      width: size,
      height: size / aspectRatio,
    });

    setImageLoaded(true);
  }, [aspectRatio]);

  // 獲取圖片的實際邊界
  const getImageBounds = useCallback(() => {
    const currentImageWidth = imageSize.width * zoom;
    const currentImageHeight = imageSize.height * zoom;

    return {
      left: imagePosition.x,
      top: imagePosition.y,
      right: imagePosition.x + currentImageWidth,
      bottom: imagePosition.y + currentImageHeight,
      width: currentImageWidth,
      height: currentImageHeight,
    };
  }, [imageSize, imagePosition, zoom]);

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

  // 處理拖拽事件（滑鼠和觸控）
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

  // 處理觸控事件
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;

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
        // 調整大小邏輯
        const deltaX = x - dragStart.x;
        const minSize = 50; // 最小裁切框大小

        setCropArea((prev) => {
          const newCrop = { ...prev };

          switch (resizeHandle) {
            case 'se': // 東南角
              newCrop.width = Math.max(minSize, prev.width + deltaX);
              newCrop.height = aspectRatio === 1 ? newCrop.width : newCrop.width / aspectRatio;
              break;
            case 'sw': // 西南角
              const newWidthSW = Math.max(minSize, prev.width - deltaX);
              newCrop.width = newWidthSW;
              newCrop.height = aspectRatio === 1 ? newWidthSW : newWidthSW / aspectRatio;
              newCrop.x = prev.x + prev.width - newWidthSW;
              break;
            case 'ne': // 東北角
              const newWidthNE = Math.max(minSize, prev.width + deltaX);
              const newHeightNE = aspectRatio === 1 ? newWidthNE : newWidthNE / aspectRatio;
              newCrop.width = newWidthNE;
              newCrop.height = newHeightNE;
              newCrop.y = prev.y + prev.height - newHeightNE;
              break;
            case 'nw': // 西北角
              const newWidthNW = Math.max(minSize, prev.width - deltaX);
              const newHeightNW = aspectRatio === 1 ? newWidthNW : newWidthNW / aspectRatio;
              newCrop.width = newWidthNW;
              newCrop.height = newHeightNW;
              newCrop.x = prev.x + prev.width - newWidthNW;
              newCrop.y = prev.y + prev.height - newHeightNW;
              break;
          }

          // 限制在圖片邊界內
          newCrop.x = Math.max(
            imageBounds.left,
            Math.min(imageBounds.right - newCrop.width, newCrop.x)
          );
          newCrop.y = Math.max(
            imageBounds.top,
            Math.min(imageBounds.bottom - newCrop.height, newCrop.y)
          );
          newCrop.width = Math.min(imageBounds.width, newCrop.width);
          newCrop.height = Math.min(imageBounds.height, newCrop.height);

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

  // 處理觸控移動事件
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging && !isResizing) return;
      if (e.touches.length !== 1) return;

      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      const imageBounds = getImageBounds();

      if (isResizing) {
        // 調整大小邏輯
        const deltaX = x - dragStart.x;
        const minSize = 50; // 最小裁切框大小

        setCropArea((prev) => {
          const newCrop = { ...prev };

          switch (resizeHandle) {
            case 'se': // 東南角
              newCrop.width = Math.max(minSize, prev.width + deltaX);
              newCrop.height = aspectRatio === 1 ? newCrop.width : newCrop.width / aspectRatio;
              break;
            case 'sw': // 西南角
              const newWidthSW = Math.max(minSize, prev.width - deltaX);
              newCrop.width = newWidthSW;
              newCrop.height = aspectRatio === 1 ? newWidthSW : newWidthSW / aspectRatio;
              newCrop.x = prev.x + prev.width - newWidthSW;
              break;
            case 'ne': // 東北角
              const newWidthNE = Math.max(minSize, prev.width + deltaX);
              const newHeightNE = aspectRatio === 1 ? newWidthNE : newWidthNE / aspectRatio;
              newCrop.width = newWidthNE;
              newCrop.height = newHeightNE;
              newCrop.y = prev.y + prev.height - newHeightNE;
              break;
            case 'nw': // 西北角
              const newWidthNW = Math.max(minSize, prev.width - deltaX);
              const newHeightNW = aspectRatio === 1 ? newWidthNW : newWidthNW / aspectRatio;
              newCrop.width = newWidthNW;
              newCrop.height = newHeightNW;
              newCrop.x = prev.x + prev.width - newWidthNW;
              newCrop.y = prev.y + prev.height - newHeightNW;
              break;
          }

          // 限制在圖片邊界內
          newCrop.x = Math.max(
            imageBounds.left,
            Math.min(imageBounds.right - newCrop.width, newCrop.x)
          );
          newCrop.y = Math.max(
            imageBounds.top,
            Math.min(imageBounds.bottom - newCrop.height, newCrop.y)
          );
          newCrop.width = Math.min(imageBounds.width, newCrop.width);
          newCrop.height = Math.min(imageBounds.height, newCrop.height);

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

  // 處理觸控結束事件
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // 縮放控制
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.2, 3); // 最大放大3倍
    setZoom(newZoom);

    // 重新計算圖片尺寸和位置
    const newWidth = imageSize.width * newZoom;
    const newHeight = imageSize.height * newZoom;

    // 如果縮放後圖片小於容器，保持居中；否則保持在左上角
    const newX = newWidth <= containerSize.width ? (containerSize.width - newWidth) / 2 : 0;
    const newY = newHeight <= containerSize.height ? (containerSize.height - newHeight) / 2 : 0;

    setImagePosition({ x: newX, y: newY });
  }, [zoom, imageSize, containerSize]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.2, 1); // 最小縮小到原始大小
    setZoom(newZoom);

    // 重新計算圖片尺寸和位置
    const newWidth = imageSize.width * newZoom;
    const newHeight = imageSize.height * newZoom;

    // 如果縮放後圖片小於容器，保持居中；否則保持在左上角
    const newX = newWidth <= containerSize.width ? (containerSize.width - newWidth) / 2 : 0;
    const newY = newHeight <= containerSize.height ? (containerSize.height - newHeight) / 2 : 0;

    setImagePosition({ x: newX, y: newY });
  }, [zoom, imageSize, containerSize]);

  // 滾輪縮放
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    },
    [handleZoomIn, handleZoomOut]
  );

  // 執行裁切
  const handleCrop = useCallback(async () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 設定輸出畫布大小
    canvas.width = outputSize;
    canvas.height = aspectRatio === 1 ? outputSize : outputSize / aspectRatio;

    // 計算縮放比例（考慮用戶縮放）
    const currentImageWidth = imageSize.width * zoom;
    const currentImageHeight = imageSize.height * zoom;

    const scaleX = img.naturalWidth / currentImageWidth;
    const scaleY = img.naturalHeight / currentImageHeight;

    // 計算相對於縮放圖片的裁切區域
    const relativeX = cropArea.x - imagePosition.x;
    const relativeY = cropArea.y - imagePosition.y;

    // 計算實際裁切區域
    const sourceX = Math.max(0, relativeX * scaleX);
    const sourceY = Math.max(0, relativeY * scaleY);
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    // 如果是圓形裁切，建立遮罩
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
    }

    // 繪製裁切後的圖片
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // 轉換為 Blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.9
    );
  }, [
    imageLoaded,
    cropArea,
    imageSize,
    imagePosition,
    zoom,
    outputSize,
    aspectRatio,
    cropShape,
    onCropComplete,
  ]);

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>裁切圖片</ModalTitle>
        </ModalHeader>

        {/* 縮放控制按鈕 */}
        <ZoomControls>
          <ZoomButton onClick={handleZoomOut} disabled={zoom <= 1}>
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
            <span>縮小</span>
          </ZoomButton>

          <ZoomDisplay>{Math.round(zoom * 100)}%</ZoomDisplay>

          <ZoomButton onClick={handleZoomIn} disabled={zoom >= 3}>
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
            <span>放大</span>
          </ZoomButton>
        </ZoomControls>

        {/* 裁切區域 */}
        <CropContainer
          width={containerSize.width}
          height={containerSize.height}
          onMouseDown={handlePointerDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ touchAction: 'none' }}
        >
          <CropImage
            ref={imageRef}
            src={imageUrl}
            alt="待裁切圖片"
            width={imageSize.width * zoom}
            height={imageSize.height * zoom}
            left={imagePosition.x}
            top={imagePosition.y}
            onLoad={handleImageLoad}
            draggable={false}
          />

          {/* 裁切框遮罩 */}
          {imageLoaded && (
            <>
              {/* 暗化區域 - 上方 */}
              <CropOverlay left={0} top={0} width={containerSize.width} height={cropArea.y} />
              {/* 暗化區域 - 下方 */}
              <CropOverlay
                left={0}
                top={cropArea.y + cropArea.height}
                width={containerSize.width}
                height={containerSize.height - (cropArea.y + cropArea.height)}
              />
              {/* 暗化區域 - 左側 */}
              <CropOverlay left={0} top={cropArea.y} width={cropArea.x} height={cropArea.height} />
              {/* 暗化區域 - 右側 */}
              <CropOverlay
                left={cropArea.x + cropArea.width}
                top={cropArea.y}
                width={containerSize.width - (cropArea.x + cropArea.width)}
                height={cropArea.height}
              />

              {/* 裁切框邊界 */}
              <CropFrame
                left={cropArea.x}
                top={cropArea.y}
                width={cropArea.width}
                height={cropArea.height}
                isCircle={cropShape === 'circle'}
                isDragging={isDragging}
                isResizing={isResizing}
              />

              {/* 調整大小的控制點 */}
              {cropShape === 'square' && (
                <>
                  {/* 西北角 */}
                  <ResizeHandle left={cropArea.x} top={cropArea.y} cursor="nw-resize" />
                  {/* 東北角 */}
                  <ResizeHandle
                    left={cropArea.x + cropArea.width}
                    top={cropArea.y}
                    cursor="ne-resize"
                  />
                  {/* 西南角 */}
                  <ResizeHandle
                    left={cropArea.x}
                    top={cropArea.y + cropArea.height}
                    cursor="sw-resize"
                  />
                  {/* 東南角 */}
                  <ResizeHandle
                    left={cropArea.x + cropArea.width}
                    top={cropArea.y + cropArea.height}
                    cursor="se-resize"
                  />
                </>
              )}

              {/* 網格線 */}
              <GridContainer
                left={cropArea.x}
                top={cropArea.y}
                width={cropArea.width}
                height={cropArea.height}
              >
                {/* 垂直線 */}
                <GridLine left="33.33%" height="100%" isVertical />
                <GridLine left="66.66%" height="100%" isVertical />
                {/* 水平線 */}
                <GridLine top="33.33%" width="100%" />
                <GridLine top="66.66%" width="100%" />
              </GridContainer>
            </>
          )}
        </CropContainer>

        {/* 操作按鈕 */}
        <ActionBar>
          <ButtonGroup>
            <Button variant="secondary" onClick={onCancel}>
              <XMarkIcon className="h-4 w-4" />
              <span>取消</span>
            </Button>
            <Button variant="primary" onClick={handleCrop} disabled={!imageLoaded}>
              <CheckIcon className="h-4 w-4" />
              <span>確認裁切</span>
            </Button>
          </ButtonGroup>
        </ActionBar>

        {/* 隱藏的畫布用於裁切 */}
        <HiddenCanvas ref={canvasRef} />
      </ModalContainer>
    </ModalOverlay>
  );
}
