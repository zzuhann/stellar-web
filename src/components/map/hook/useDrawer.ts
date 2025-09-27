import { useMapStore } from '@/store';
import { config, useSpring } from '@react-spring/web';
import { useEffect, useRef, useCallback } from 'react';

// 三段高度設定
export const COLLAPSED_HEIGHT = 90; // 收合高度
export const SINGLE_ITEM_HEIGHT = 250; // 單一活動顯示高度

const useDrawer = () => {
  const {
    selectedEventId,
    isDrawerExpanded,
    setIsDrawerExpanded,
    expandedHeight,
    setExpandedHeight,
  } = useMapStore();

  const toggleDrawer = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  // 根據選中狀態決定目標展開高度
  const getTargetExpandedHeight = useCallback(
    () => (selectedEventId ? SINGLE_ITEM_HEIGHT : expandedHeight),
    [selectedEventId, expandedHeight]
  );

  // React Spring 動畫 - 使用內建 config
  const [springs, api] = useSpring(() => ({
    height: COLLAPSED_HEIGHT,
    config: config.gentle,
  }));

  // 跟隨拖曳的兩段式邏輯
  const bind = (() => {
    let startY = 0;
    let startHeight = 0;
    let isDragging = false;

    const onStart = (e: React.MouseEvent | React.TouchEvent) => {
      const currentHeight = springs.height.get();

      // 如果當前是單一活動顯示模式，不允許拖曳
      if (selectedEventId && Math.abs(currentHeight - SINGLE_ITEM_HEIGHT) < 10) {
        return;
      }

      isDragging = true;
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startHeight = currentHeight;
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = (startY - clientY) * 1; // 向上為正值，提高敏感度讓拖曳更輕鬆
      const maxHeight = getTargetExpandedHeight();
      const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(maxHeight, startHeight + deltaY));

      // 即時跟隨拖曳
      api.start({ height: newHeight, immediate: true });
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      // 根據起始狀態使用不同的閾值
      const currentHeight = springs.height.get();
      const targetExpandedHeight = getTargetExpandedHeight();
      const totalRange = targetExpandedHeight - COLLAPSED_HEIGHT;

      let shouldExpand;
      if (startHeight <= COLLAPSED_HEIGHT + 50) {
        // 從收合狀態開始：30% 就展開
        const expandThreshold = totalRange * 0.3;
        shouldExpand = currentHeight > COLLAPSED_HEIGHT + expandThreshold;
      } else {
        // 從展開狀態開始：需要拖到 70% 以下才縮合
        const collapseThreshold = totalRange * 0.7;
        shouldExpand = currentHeight > COLLAPSED_HEIGHT + collapseThreshold;
      }

      if (shouldExpand) {
        if (!isDrawerExpanded) {
          setIsDrawerExpanded(true);
        } else {
          // 如果已經是展開狀態，直接執行動畫到目標高度
          api.start({
            height: targetExpandedHeight,
            config: config.gentle,
            immediate: false,
          });
        }
      } else {
        if (isDrawerExpanded) {
          setIsDrawerExpanded(false);
        } else {
          // 如果已經是收合狀態，直接執行動畫到收合高度
          api.start({
            height: COLLAPSED_HEIGHT,
            config: config.gentle,
            immediate: false,
          });
        }
      }
    };

    // 統一的事件處理
    const handleMouseDown = (e: React.MouseEvent) => {
      onStart(e);

      const cleanup = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      const handleMouseUp = () => {
        onEnd();
        cleanup();
      };

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      onStart(e);

      const cleanup = () => {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      const handleTouchEnd = () => {
        onEnd();
        cleanup();
      };

      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    return { handleMouseDown, handleTouchStart };
  })();

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
      const targetHeight = isDrawerExpanded ? getTargetExpandedHeight() : COLLAPSED_HEIGHT;

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
  }, [isDrawerExpanded, selectedEventId, api, getTargetExpandedHeight]);

  return {
    isDrawerExpanded,
    toggleDrawer,
    springs,
    api,
    bind,
  };
};

export default useDrawer;
