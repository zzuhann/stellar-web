'use client';

import { useState, useRef, useCallback, useEffect, RefCallback, RefObject } from 'react';

const PEEK_HEIGHT = 120;
// Fraction of window height for half-open state
const HALF_FRACTION = 0.55;
// Dragging past this fraction triggers list mode
const LIST_TRIGGER_FRACTION = 0.72;

export interface UseBottomSheetOptions {
  onRequestListMode: (triggerMethod: 'drag' | 'list_button') => void;
  onExpandToHalf?: (triggerMethod: 'drag' | 'tap_handle') => void;
  halfHeight?: number;
  /** Touch/mouse events targeting this element (or its descendants) will not start a drag */
  excludeRef?: RefObject<HTMLElement | null>;
  initialHeight?: number;
}

export interface UseBottomSheetReturn {
  height: number;
  isAnimating: boolean;
  isHalfOpen: boolean;
  handleBarBind: {
    onMouseDown: (e: React.MouseEvent) => void;
    ref: RefCallback<HTMLElement>;
  };
  onTransitionEnd: () => void;
  snapToHalf: () => void;
}

export function useBottomSheet({
  onRequestListMode,
  onExpandToHalf,
  halfHeight: halfHeightProp,
  excludeRef,
  initialHeight,
}: UseBottomSheetOptions): UseBottomSheetReturn {
  const [height, setHeight] = useState(initialHeight ?? PEEK_HEIGHT);
  const [isAnimating, setIsAnimating] = useState(false);

  const heightRef = useRef(initialHeight ?? PEEK_HEIGHT);
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
      if (isPeek) onExpandToHalf?.('tap_handle');
      snapTo(isPeek ? halfHeight : PEEK_HEIGHT);
      return;
    }

    // Dragged past list trigger threshold
    if (currentHeight >= listTrigger) {
      snapTo(PEEK_HEIGHT);
      onRequestListMode('drag');
      return;
    }

    // Snap to nearest: half or peek
    const midPoint = PEEK_HEIGHT + (halfHeight - PEEK_HEIGHT) * 0.5;
    if (currentHeight > midPoint) onExpandToHalf?.('drag');
    snapTo(currentHeight > midPoint ? halfHeight : PEEK_HEIGHT);
  }, [getHalfHeight, getListTriggerHeight, snapTo, onRequestListMode, onExpandToHalf]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (excludeRef?.current?.contains(e.target as Node)) return;
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

  // Keep stable refs so the native listener closure doesn't go stale
  const handleDragEndRef = useRef(handleDragEnd);
  useEffect(() => {
    handleDragEndRef.current = handleDragEnd;
  }, [handleDragEnd]);

  const getListTriggerHeightRef = useRef(getListTriggerHeight);
  useEffect(() => {
    getListTriggerHeightRef.current = getListTriggerHeight;
  }, [getListTriggerHeight]);

  const handleBarElementRef = useRef<HTMLElement | null>(null);
  const touchStartHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);

  // Callback ref: attach native touchstart (passive:false) when element mounts, detach on unmount.
  // Using a callback ref instead of useEffect because ref mutation doesn't trigger re-render.
  const handleBarRef: RefCallback<HTMLElement> = useCallback((el) => {
    if (handleBarElementRef.current && touchStartHandlerRef.current) {
      handleBarElementRef.current.removeEventListener('touchstart', touchStartHandlerRef.current);
    }

    handleBarElementRef.current = el;

    if (!el) {
      touchStartHandlerRef.current = null;
      return;
    }

    const handler = (e: TouchEvent) => {
      if (excludeRef?.current?.contains(e.target as Node)) return;
      e.preventDefault();
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
          Math.min(
            getListTriggerHeightRef.current() + 20,
            dragStateRef.current.startHeight + deltaY
          )
        );
        setHeight(newHeight);
        heightRef.current = newHeight;
      };

      const onEnd = () => {
        lastTouchEndTimeRef.current = Date.now();
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        if (dragStateRef.current.isDragging) handleDragEndRef.current();
      };

      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    touchStartHandlerRef.current = handler;
    el.addEventListener('touchstart', handler, { passive: false });
  }, []);

  const snapToHalf = useCallback(() => {
    snapTo(getHalfHeight());
  }, [snapTo, getHalfHeight]);

  const isHalfOpen = height > PEEK_HEIGHT;

  return {
    height,
    isAnimating,
    isHalfOpen,
    handleBarBind: { onMouseDown, ref: handleBarRef },
    onTransitionEnd,
    snapToHalf,
  };
}
