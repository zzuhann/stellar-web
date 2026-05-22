import { useMapStore } from '@/store';
import { useEffect, useRef, useState, useCallback } from 'react';

// 高度設定
export const COLLAPSED_HEIGHT = 90;
export const HANDLE_BAR_HEIGHT = 90;
export const CARD_HEIGHT = 132;
export const CARD_GAP = 16;
export const CONTENT_PADDING = 16;

// 計算動態最大高度的純函數
export const calculateMaxHeight = (eventsCount: number, screenHeight: number) => {
  const minContentHeight = HANDLE_BAR_HEIGHT + CONTENT_PADDING * 2 + CARD_HEIGHT + 20;

  const contentHeight =
    eventsCount === 0
      ? minContentHeight
      : HANDLE_BAR_HEIGHT +
        CONTENT_PADDING * 2 +
        CARD_HEIGHT * eventsCount +
        CARD_GAP * (eventsCount - 1) +
        20;

  const maxScreenHeight = screenHeight * 0.75;
  return Math.min(contentHeight, maxScreenHeight);
};

type UseDrawerOptions = {
  eventsCount: number;
};

const useDrawer = ({ eventsCount }: UseDrawerOptions) => {
  const { isDrawerExpanded, setIsDrawerExpanded, setExpandedHeight } = useMapStore();

  // 當前高度與動畫狀態
  const [height, setHeight] = useState(COLLAPSED_HEIGHT);
  const [isAnimating, setIsAnimating] = useState(false);

  // 用 ref 追蹤當前高度，避免 closure 問題
  const heightRef = useRef(height);
  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  // 拖曳狀態
  const dragStateRef = useRef({
    isDragging: false,
    startY: 0,
    startHeight: 0,
    maxHeight: 0,
  });

  // 取得當前最大高度
  const getMaxHeight = useCallback(() => {
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    return calculateMaxHeight(eventsCount, screenHeight);
  }, [eventsCount]);

  // 在客戶端設置展開高度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setExpandedHeight(window.innerHeight * 0.75);
    }
  }, [setExpandedHeight]);

  // 監聽 store 狀態變化，執行動畫
  const prevIsExpandedRef = useRef(isDrawerExpanded);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    const prevIsExpanded = prevIsExpandedRef.current;

    if (prevIsExpanded !== isDrawerExpanded) {
      // 如果是內部改變（拖曳結束），不執行動畫（已經在拖曳結束時處理了）
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
      } else {
        // 外部改變，執行動畫
        setIsAnimating(true);
        const targetHeight = isDrawerExpanded ? getMaxHeight() : COLLAPSED_HEIGHT;
        setHeight(targetHeight);
      }
    }

    prevIsExpandedRef.current = isDrawerExpanded;
  }, [isDrawerExpanded, getMaxHeight]);

  // 當 eventsCount 改變時，如果已展開就更新高度
  useEffect(() => {
    if (isDrawerExpanded && !dragStateRef.current.isDragging) {
      setIsAnimating(true);
      setHeight(getMaxHeight());
    }
  }, [eventsCount, isDrawerExpanded, getMaxHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 停止動畫，進入拖曳模式
    setIsAnimating(false);
    const maxHeight = getMaxHeight();
    const currentHeight = heightRef.current;

    dragStateRef.current = {
      isDragging: true,
      startY: e.clientY,
      startHeight: currentHeight,
      maxHeight,
    };

    const onMove = (moveEvent: MouseEvent) => {
      const { isDragging, startY, startHeight, maxHeight } = dragStateRef.current;
      if (!isDragging) return;
      moveEvent.preventDefault();

      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(maxHeight, startHeight + deltaY));
      setHeight(newHeight);
    };

    const onEnd = () => {
      const { isDragging, startHeight, maxHeight } = dragStateRef.current;
      if (!isDragging) return;
      dragStateRef.current.isDragging = false;

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);

      const currentHeight = heightRef.current;
      const dragDistance = Math.abs(currentHeight - startHeight);

      // 點擊 toggle
      if (dragDistance < 10) {
        const expanded = useMapStore.getState().isDrawerExpanded;
        isInternalChangeRef.current = true;
        setIsDrawerExpanded(!expanded);
        setIsAnimating(true);
        setHeight(!expanded ? maxHeight : COLLAPSED_HEIGHT);
        return;
      }

      // 決定展開或收合
      const midPoint = COLLAPSED_HEIGHT + (maxHeight - COLLAPSED_HEIGHT) * 0.5;
      const expanded = useMapStore.getState().isDrawerExpanded;

      isInternalChangeRef.current = true;
      setIsAnimating(true);

      if (currentHeight > midPoint) {
        if (!expanded) setIsDrawerExpanded(true);
        setHeight(maxHeight);
      } else {
        if (expanded) setIsDrawerExpanded(false);
        setHeight(COLLAPSED_HEIGHT);
      }
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd, { passive: false });
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      // 停止動畫，進入拖曳模式
      setIsAnimating(false);
      const maxHeight = getMaxHeight();
      const currentHeight = heightRef.current;

      dragStateRef.current = {
        isDragging: true,
        startY: e.touches[0].clientY,
        startHeight: currentHeight,
        maxHeight,
      };

      const onMove = (moveEvent: TouchEvent) => {
        const { isDragging, startY, startHeight, maxHeight } = dragStateRef.current;
        if (!isDragging) return;
        moveEvent.preventDefault();

        const deltaY = startY - moveEvent.touches[0].clientY;
        const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(maxHeight, startHeight + deltaY));
        setHeight(newHeight);
      };

      const onEnd = () => {
        const { isDragging, startHeight, maxHeight } = dragStateRef.current;
        if (!isDragging) return;
        dragStateRef.current.isDragging = false;

        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);

        const currentHeight = heightRef.current;
        const dragDistance = Math.abs(currentHeight - startHeight);

        // 點擊 toggle
        if (dragDistance < 10) {
          const expanded = useMapStore.getState().isDrawerExpanded;
          isInternalChangeRef.current = true;
          setIsDrawerExpanded(!expanded);
          setIsAnimating(true);
          setHeight(!expanded ? maxHeight : COLLAPSED_HEIGHT);
          return;
        }

        // 決定展開或收合
        const midPoint = COLLAPSED_HEIGHT + (maxHeight - COLLAPSED_HEIGHT) * 0.5;
        const expanded = useMapStore.getState().isDrawerExpanded;

        isInternalChangeRef.current = true;
        setIsAnimating(true);

        if (currentHeight > midPoint) {
          if (!expanded) setIsDrawerExpanded(true);
          setHeight(maxHeight);
        } else {
          if (expanded) setIsDrawerExpanded(false);
          setHeight(COLLAPSED_HEIGHT);
        }
      };

      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    },
    [getMaxHeight, setIsDrawerExpanded]
  );

  const bind = { handleMouseDown, handleTouchStart };

  const toggleDrawer = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  // 回傳用於 style 的物件
  const style = {
    height,
    transition: isAnimating ? 'height 0.3s ease-out' : 'none',
  };

  return {
    isDrawerExpanded,
    toggleDrawer,
    style,
    bind,
  };
};

export default useDrawer;
