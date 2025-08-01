'use client';

import { useState, useRef, useCallback } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';

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

    // 動態計算容器大小，最大600px
    const maxContainerSize = 600;
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
      const handleSize = 8; // 控制點大小的一半
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

  // 處理拖拽事件
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">裁切圖片</h3>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <ArrowsPointingOutIcon className="h-4 w-4" />
              <span>拖拽移動</span>
            </div>
            <span>•</span>
            <span>角落調整大小</span>
            <span>•</span>
            <span>滾輪縮放</span>
          </div>
        </div>

        {/* 縮放控制按鈕 */}
        <div className="flex justify-center items-center space-x-4 mb-4">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
            <span className="text-sm">縮小</span>
          </button>

          <div className="text-sm text-gray-600 min-w-20 text-center">
            {Math.round(zoom * 100)}%
          </div>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
            <span className="text-sm">放大</span>
          </button>
        </div>

        {/* 裁切區域 */}
        <div
          className="relative mx-auto border border-gray-300 overflow-hidden"
          style={{ width: containerSize.width, height: containerSize.height }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="待裁切圖片"
            className="absolute"
            style={{
              width: imageSize.width * zoom,
              height: imageSize.height * zoom,
              left: imagePosition.x,
              top: imagePosition.y,
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />

          {/* 裁切框遮罩 */}
          {imageLoaded && (
            <>
              {/* 暗化區域 - 上方 */}
              <div
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  right: 0,
                  height: cropArea.y,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              />
              {/* 暗化區域 - 下方 */}
              <div
                className="absolute"
                style={{
                  left: 0,
                  top: cropArea.y + cropArea.height,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              />
              {/* 暗化區域 - 左側 */}
              <div
                className="absolute"
                style={{
                  left: 0,
                  top: cropArea.y,
                  width: cropArea.x,
                  height: cropArea.height,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              />
              {/* 暗化區域 - 右側 */}
              <div
                className="absolute"
                style={{
                  left: cropArea.x + cropArea.width,
                  top: cropArea.y,
                  right: 0,
                  height: cropArea.height,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              />

              {/* 裁切框邊界 */}
              <div
                className={`absolute border-2 border-white ${
                  cropShape === 'circle' ? 'rounded-full' : ''
                } ${isDragging ? 'cursor-grabbing' : isResizing ? 'cursor-resize' : 'cursor-grab'}`}
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                }}
              />

              {/* 調整大小的控制點 */}
              {cropShape === 'square' && (
                <>
                  {/* 西北角 */}
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-blue-500 cursor-nw-resize transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                    }}
                  />
                  {/* 東北角 */}
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-blue-500 cursor-ne-resize transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: cropArea.x + cropArea.width,
                      top: cropArea.y,
                    }}
                  />
                  {/* 西南角 */}
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-blue-500 cursor-sw-resize transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y + cropArea.height,
                    }}
                  />
                  {/* 東南角 */}
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-blue-500 cursor-se-resize transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: cropArea.x + cropArea.width,
                      top: cropArea.y + cropArea.height,
                    }}
                  />
                </>
              )}

              {/* 網格線 */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                }}
              >
                {/* 垂直線 */}
                <div
                  className="absolute w-px bg-white opacity-50"
                  style={{ left: '33.33%', height: '100%' }}
                />
                <div
                  className="absolute w-px bg-white opacity-50"
                  style={{ left: '66.66%', height: '100%' }}
                />
                {/* 水平線 */}
                <div
                  className="absolute h-px bg-white opacity-50"
                  style={{ top: '33.33%', width: '100%' }}
                />
                <div
                  className="absolute h-px bg-white opacity-50"
                  style={{ top: '66.66%', width: '100%' }}
                />
              </div>
            </>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            縮放：{Math.round(zoom * 100)}% • 輸出：{outputSize}×
            {aspectRatio === 1 ? outputSize : Math.round(outputSize / aspectRatio)}px
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>取消</span>
            </button>
            <button
              onClick={handleCrop}
              disabled={!imageLoaded}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              <span>確認裁切</span>
            </button>
          </div>
        </div>

        {/* 隱藏的畫布用於裁切 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
