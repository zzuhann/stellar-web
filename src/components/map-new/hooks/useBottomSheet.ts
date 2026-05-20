'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const PEEK_HEIGHT = 120;
// Fraction of window height for half-open state
const HALF_FRACTION = 0.55;
// Dragging past this fraction triggers list mode
const LIST_TRIGGER_FRACTION = 0.72;

export interface UseBottomSheetOptions {
  onRequestListMode: () => void;
  halfHeight?: number;
}

export interface UseBottomSheetReturn {
  height: number;
  isAnimating: boolean;
  isHalfOpen: boolean;
  handleBarBind: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  onTransitionEnd: () => void;
  snapToHalf: () => void;
}

export function useBottomSheet({
  onRequestListMode,
  halfHeight: halfHeightProp,
}: UseBottomSheetOptions): UseBottomSheetReturn {
  const [height, setHeight] = useState(PEEK_HEIGHT);
  const [isAnimating, setIsAnimating] = useState(false);

  const heightRef = useRef(PEEK_HEIGHT);
  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  const onTransitionEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const getHalfHeight = useCallback(() => {
    if (typeof window === 'undefined') return 400; // SSR placeholder, never reached in practice ('use client')
    if (halfHeightProp !== undefined) {
      const maxHalf = Math.round(window.innerHeight * 0.85);
      return Math.min(halfHeightProp, maxHalf);
    }
    return Math.round(window.innerHeight * HALF_FRACTION);
  }, [halfHeightProp]);

  const getListTriggerHeight = useCallback(() => {
    if (typeof window === 'undefined') return 600;
    return Math.round(window.innerHeight * LIST_TRIGGER_FRACTION);
  }, []);

  const snapTo = useCallback((targetHeight: number) => {
    setIsAnimating(true);
    setHeight(targetHeight);
    heightRef.current = targetHeight;
  }, []);

  const dragStateRef = useRef({
    isDragging: false,
    startY: 0,
    startHeight: 0,
  });

  // Prevent synthesized mouse events that fire after touchend from double-triggering
  const lastTouchEndTimeRef = useRef(0);

  const handleDragEnd = useCallback(() => {
    const { startHeight } = dragStateRef.current;
    dragStateRef.current.isDragging = false;

    const currentHeight = heightRef.current;
    const listTrigger = getListTriggerHeight();
    const halfHeight = getHalfHeight();
    const dragDistance = Math.abs(currentHeight - startHeight);

    // Tap (no drag movement) → toggle peek/half
    if (dragDistance < 10) {
      const isPeek = startHeight <= PEEK_HEIGHT;
      snapTo(isPeek ? halfHeight : PEEK_HEIGHT);
      return;
    }

    // Dragged past list trigger threshold
    if (currentHeight >= listTrigger) {
      snapTo(PEEK_HEIGHT);
      onRequestListMode();
      return;
    }

    // Snap to nearest: half or peek
    const midPoint = PEEK_HEIGHT + (halfHeight - PEEK_HEIGHT) * 0.5;
    snapTo(currentHeight > midPoint ? halfHeight : PEEK_HEIGHT);
  }, [getHalfHeight, getListTriggerHeight, snapTo, onRequestListMode]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (Date.now() - lastTouchEndTimeRef.current < 500) return;
      setIsAnimating(false);
      dragStateRef.current = {
        isDragging: true,
        startY: e.clientY,
        startHeight: heightRef.current,
      };

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragStateRef.current.isDragging) return;
        moveEvent.preventDefault();
        const deltaY = dragStateRef.current.startY - moveEvent.clientY;
        const newHeight = Math.max(
          PEEK_HEIGHT,
          Math.min(getListTriggerHeight() + 20, dragStateRef.current.startHeight + deltaY)
        );
        setHeight(newHeight);
        heightRef.current = newHeight;
      };

      const onEnd = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        if (dragStateRef.current.isDragging) handleDragEnd();
      };

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
    },
    [getListTriggerHeight, handleDragEnd]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsAnimating(false);
      dragStateRef.current = {
        isDragging: true,
        startY: e.touches[0].clientY,
        startHeight: heightRef.current,
      };

      const onMove = (moveEvent: TouchEvent) => {
        if (!dragStateRef.current.isDragging) return;
        moveEvent.preventDefault();
        const deltaY = dragStateRef.current.startY - moveEvent.touches[0].clientY;
        const newHeight = Math.max(
          PEEK_HEIGHT,
          Math.min(getListTriggerHeight() + 20, dragStateRef.current.startHeight + deltaY)
        );
        setHeight(newHeight);
        heightRef.current = newHeight;
      };

      const onEnd = () => {
        lastTouchEndTimeRef.current = Date.now();
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        if (dragStateRef.current.isDragging) handleDragEnd();
      };

      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    },
    [getListTriggerHeight, handleDragEnd]
  );

  const snapToHalf = useCallback(() => {
    snapTo(getHalfHeight());
  }, [snapTo, getHalfHeight]);

  const isHalfOpen = height > PEEK_HEIGHT;

  return {
    height,
    isAnimating,
    isHalfOpen,
    handleBarBind: { onMouseDown, onTouchStart },
    onTransitionEnd,
    snapToHalf,
  };
}
