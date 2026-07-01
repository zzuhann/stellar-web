'use client';

import { useState, useRef, useCallback, useEffect, RefCallback, RefObject } from 'react';

const PEEK_HEIGHT = 120;
// Fraction of window height for half-open state
const HALF_FRACTION = 0.55;

export interface UseBottomSheetOptions {
  onExpandToHalf?: (triggerMethod: 'drag' | 'tap_handle') => void;
  halfHeight?: number;
  /** Touch/mouse events targeting this element (or its descendants) will not start a drag */
  excludeRef?: RefObject<HTMLElement | null>;
  initialHeight?: number;
  /** Ref to the DOM element that will have its transform mutated directly during drag */
  containerRef?: RefObject<HTMLElement | null>;
  /** Returns the CSS transform string for a given height value */
  getTransform?: (height: number) => string;
  /** Called on every drag frame with the current height; use a ref-stable callback to avoid stale closures */
  onDragMove?: (height: number) => void;
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
  onExpandToHalf,
  halfHeight: halfHeightProp,
  excludeRef,
  initialHeight,
  containerRef,
  getTransform,
  onDragMove,
}: UseBottomSheetOptions): UseBottomSheetReturn {
  const [height, setHeight] = useState(initialHeight ?? PEEK_HEIGHT);
  const [isAnimating, setIsAnimating] = useState(false);

  const heightRef = useRef(initialHeight ?? PEEK_HEIGHT);
  // Keep a stable ref to getTransform to avoid stale closures when maxHeight changes
  const getTransformRef = useRef(getTransform);
  const onDragMoveRef = useRef(onDragMove);
  const dragStateRef = useRef({
    isDragging: false,
    startY: 0,
    startHeight: 0,
  });
  // Prevent synthesized mouse events that fire after touchend from double-triggering
  const lastTouchEndTimeRef = useRef(0);
  // Stable ref so the native touch listener closure doesn't go stale
  const handleDragEndRef = useRef<() => void>(() => {});
  const handleBarElementRef = useRef<HTMLElement | null>(null);
  const touchStartHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);

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

  // Mutates the DOM directly during drag to skip React re-render; falls back to
  // only updating the ref when containerRef/getTransform are not provided.
  const applyDragHeight = useCallback(
    (newHeight: number) => {
      heightRef.current = newHeight;
      if (containerRef?.current && getTransformRef.current) {
        containerRef.current.style.transform = getTransformRef.current(newHeight);
      }
      onDragMoveRef.current?.(newHeight);
    },
    [containerRef]
  );

  const snapTo = useCallback(
    (targetHeight: number) => {
      setIsAnimating(true);
      setHeight(targetHeight);
      applyDragHeight(targetHeight);
    },
    [applyDragHeight]
  );

  const handleDragEnd = useCallback(() => {
    const { startHeight } = dragStateRef.current;
    dragStateRef.current.isDragging = false;

    const currentHeight = heightRef.current;
    const halfHeight = getHalfHeight();
    const dragDistance = Math.abs(currentHeight - startHeight);

    // Tap (no drag movement) → toggle peek/half
    if (dragDistance < 10) {
      const isPeek = startHeight <= PEEK_HEIGHT;
      if (isPeek) onExpandToHalf?.('tap_handle');
      snapTo(isPeek ? halfHeight : PEEK_HEIGHT);
      return;
    }

    // Snap to nearest: half or peek
    const midPoint = PEEK_HEIGHT + (halfHeight - PEEK_HEIGHT) * 0.3;
    if (currentHeight > midPoint) onExpandToHalf?.('drag');
    snapTo(currentHeight > midPoint ? halfHeight : PEEK_HEIGHT);
  }, [getHalfHeight, snapTo, onExpandToHalf]);

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
          Math.min(getHalfHeight(), dragStateRef.current.startHeight + deltaY)
        );
        applyDragHeight(newHeight);
      };

      const onEnd = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        if (dragStateRef.current.isDragging) handleDragEnd();
      };

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
    },
    [excludeRef, getHalfHeight, handleDragEnd, applyDragHeight]
  );

  // Callback ref: attach native touchstart (passive:false) when element mounts, detach on unmount.
  // Using a callback ref instead of useEffect because ref mutation doesn't trigger re-render.
  const handleBarRef: RefCallback<HTMLElement> = useCallback(
    (el) => {
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
            Math.min(getHalfHeight(), dragStateRef.current.startHeight + deltaY)
          );
          applyDragHeight(newHeight);
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
    },
    [excludeRef, getHalfHeight, applyDragHeight]
  );

  const snapToHalf = useCallback(() => {
    snapTo(getHalfHeight());
  }, [snapTo, getHalfHeight]);

  const isHalfOpen = height > PEEK_HEIGHT;

  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  useEffect(() => {
    getTransformRef.current = getTransform;
  }, [getTransform]);

  useEffect(() => {
    onDragMoveRef.current = onDragMove;
  }, [onDragMove]);

  useEffect(() => {
    handleDragEndRef.current = handleDragEnd;
  }, [handleDragEnd]);

  return {
    height,
    isAnimating,
    isHalfOpen,
    handleBarBind: { onMouseDown, ref: handleBarRef },
    onTransitionEnd,
    snapToHalf,
  };
}
