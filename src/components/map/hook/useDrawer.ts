import { useMapStore } from '@/store';
import { config, useSpring } from '@react-spring/web';
import { useEffect, useRef, useCallback, useMemo } from 'react';

// 高度設定
export const COLLAPSED_HEIGHT = 90; // 收合高度
export const HANDLE_BAR_HEIGHT = 90; // HandleBar 高度
export const CARD_HEIGHT = 132; // EventCard 大約高度
export const CARD_GAP = 16; // 卡片之間的 gap
export const CONTENT_PADDING = 16; // DrawerContent 的 padding

type UseDrawerOptions = {
  eventsCount: number;
};

const useDrawer = ({ eventsCount }: UseDrawerOptions) => {
  const {
    selectedEventId,
    isDrawerExpanded,
    setIsDrawerExpanded,
    expandedHeight,
    setExpandedHeight,
  } = useMapStore();

  const toggleDrawer = useCallback(() => {
    setIsDrawerExpanded(!isDrawerExpanded);
  }, [isDrawerExpanded, setIsDrawerExpanded]);

  // 計算內容實際需要的高度
  const contentHeight = useMemo(() => {
    // 至少要能顯示一個卡片的高度（給 EmptyState 或單一活動用）
    const minContentHeight = HANDLE_BAR_HEIGHT + CONTENT_PADDING * 2 + CARD_HEIGHT + 20;
    if (eventsCount === 0) return minContentHeight;
    // HandleBar + padding + (卡片高度 × 數量) + (gap × (數量-1)) + 額外緩衝
    return (
      HANDLE_BAR_HEIGHT +
      CONTENT_PADDING * 2 +
      CARD_HEIGHT * eventsCount +
      CARD_GAP * (eventsCount - 1) +
      20 // 緩衝
    );
  }, [eventsCount]);

  // 動態最大高度：取內容高度與 75% 螢幕高度的較小值
  const dynamicMaxHeight = useMemo(() => {
    return Math.min(contentHeight, expandedHeight);
  }, [contentHeight, expandedHeight]);

  // 中間停留高度：約 40% 螢幕高度，但不超過動態最大高度
  const midHeight = useMemo(() => {
    if (typeof window === 'undefined') return 300;
    const mid = window.innerHeight * 0.4;
    // 如果動態最大高度小於中間高度，就不需要中間停留點
    return dynamicMaxHeight > mid ? mid : null;
  }, [dynamicMaxHeight]);

  // 根據選中狀態決定目標展開高度
  const getTargetExpandedHeight = useCallback(
    () => (selectedEventId ? Math.min(contentHeight, expandedHeight) : dynamicMaxHeight),
    [selectedEventId, contentHeight, expandedHeight, dynamicMaxHeight]
  );

  // React Spring 動畫 - 使用內建 config
  const [springs, api] = useSpring(() => ({
    height: COLLAPSED_HEIGHT,
    config: config.gentle,
  }));

  // 拖曳狀態使用 ref 避免 closure 問題
  const dragStateRef = useRef({
    isDragging: false,
    startY: 0,
    startHeight: 0,
  });

  // 將依賴的值也存到 ref，確保 event handler 中取得最新值
  const stateRef = useRef({
    midHeight,
    isDrawerExpanded,
    getTargetExpandedHeight,
  });

  useEffect(() => {
    stateRef.current = { midHeight, isDrawerExpanded, getTargetExpandedHeight };
  }, [midHeight, isDrawerExpanded, getTargetExpandedHeight]);

  // 跟隨拖曳邏輯
  const bind = useMemo(() => {
    const onStart = (e: React.MouseEvent | React.TouchEvent) => {
      const currentHeight = springs.height.get();
      dragStateRef.current = {
        isDragging: true,
        startY: 'touches' in e ? e.touches[0].clientY : e.clientY,
        startHeight: currentHeight,
      };
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const { isDragging, startY, startHeight } = dragStateRef.current;
      if (!isDragging) return;
      e.preventDefault();

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = startY - clientY;
      const maxHeight = stateRef.current.getTargetExpandedHeight();
      const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(maxHeight, startHeight + deltaY));

      api.start({ height: newHeight, immediate: true });
    };

    const onEnd = () => {
      const { isDragging, startHeight } = dragStateRef.current;
      if (!isDragging) return;
      dragStateRef.current.isDragging = false;

      const currentHeight = springs.height.get();
      const {
        midHeight: mid,
        isDrawerExpanded: expanded,
        getTargetExpandedHeight: getMax,
      } = stateRef.current;
      const maxHeight = getMax();

      // 如果幾乎沒有拖曳（只是點擊），則 toggle
      const dragDistance = Math.abs(currentHeight - startHeight);
      if (dragDistance < 10) {
        toggleDrawer();
        return;
      }

      // 如果有中間停留點，使用三段邏輯
      if (mid !== null) {
        const lowerThreshold = (COLLAPSED_HEIGHT + mid) / 2;
        const upperThreshold = (mid + maxHeight) / 2;

        let targetHeight: number;

        if (currentHeight < lowerThreshold) {
          targetHeight = COLLAPSED_HEIGHT;
          if (expanded) setIsDrawerExpanded(false);
        } else if (currentHeight < upperThreshold) {
          targetHeight = mid;
          if (!expanded) setIsDrawerExpanded(true);
        } else {
          targetHeight = maxHeight;
          if (!expanded) setIsDrawerExpanded(true);
        }

        api.start({ height: targetHeight, config: config.gentle, immediate: false });
      } else {
        // 沒有中間停留點，使用兩段邏輯
        const totalRange = maxHeight - COLLAPSED_HEIGHT;

        let shouldExpand;
        if (startHeight <= COLLAPSED_HEIGHT + 50) {
          shouldExpand = currentHeight > COLLAPSED_HEIGHT + totalRange * 0.3;
        } else {
          shouldExpand = currentHeight > COLLAPSED_HEIGHT + totalRange * 0.7;
        }

        if (shouldExpand) {
          if (!expanded) {
            setIsDrawerExpanded(true);
          } else {
            api.start({ height: maxHeight, config: config.gentle, immediate: false });
          }
        } else {
          if (expanded) {
            setIsDrawerExpanded(false);
          } else {
            api.start({ height: COLLAPSED_HEIGHT, config: config.gentle, immediate: false });
          }
        }
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      onStart(e);

      const handleMouseUp = () => {
        onEnd();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      onStart(e);

      const handleTouchEnd = () => {
        onEnd();
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    return { handleMouseDown, handleTouchStart };
  }, [api, springs.height, toggleDrawer, setIsDrawerExpanded]);

  // 在客戶端設置展開高度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setExpandedHeight(window.innerHeight * 0.75);
    }
  }, [setExpandedHeight]);

  // 監聽 store 狀態變化，自動執行動畫
  const prevIsExpandedRef = useRef(isDrawerExpanded);
  const prevSelectedEventIdRef = useRef(selectedEventId);

  useEffect(() => {
    const prevIsExpanded = prevIsExpandedRef.current;
    const prevSelectedEventId = prevSelectedEventIdRef.current;

    // 如果展開狀態改變
    if (prevIsExpanded !== isDrawerExpanded) {
      // 展開時，先到中間高度（如果有的話），否則到最大高度
      const targetHeight = isDrawerExpanded
        ? midHeight !== null
          ? midHeight
          : getTargetExpandedHeight()
        : COLLAPSED_HEIGHT;

      api.start({
        height: targetHeight,
        config: config.gentle,
        immediate: false,
      });
    }

    // 如果選中的活動改變且 drawer 是展開的，且不是從有值變為 null（關閉操作）
    if (prevSelectedEventId !== selectedEventId && isDrawerExpanded && selectedEventId !== null) {
      const targetHeight = getTargetExpandedHeight();

      api.start({
        height: targetHeight,
        config: config.gentle,
        immediate: false,
      });
    }

    // 更新 ref
    prevIsExpandedRef.current = isDrawerExpanded;
    prevSelectedEventIdRef.current = selectedEventId;
  }, [isDrawerExpanded, selectedEventId, api, getTargetExpandedHeight, midHeight]);

  return {
    isDrawerExpanded,
    toggleDrawer,
    springs,
    api,
    bind,
  };
};

export default useDrawer;
