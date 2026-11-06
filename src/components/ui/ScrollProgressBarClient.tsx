'use client';

import { useCallback, useRef, type RefObject } from 'react';
import { css, cx } from '@/styled-system/css';
import { scrollProgress, useScrollListener } from '@/hooks/useHorizontalScroll';

const track = css({
  height: '3px',
  borderRadius: '2px',
  background: 'gray.100',
  overflow: 'hidden',
});

const bar = css({
  height: '100%',
  borderRadius: '2px',
  width: '100%',
  background: 'color.primary',
  transformOrigin: 'left',
});

const MIN_FILL = 0.08;

interface ScrollProgressBarProps {
  scrollRef: RefObject<HTMLElement | null>;
  contentKey: unknown;
  visible: boolean;
  className?: string;
}

// Stands in for the hidden native scrollbar; always takes its 3px so showing it never shifts layout.
// Fill is written straight to the DOM on each scroll (no React render, no transition) so it tracks the finger;
// scaleX instead of width keeps it on the compositor.
export default function ScrollProgressBarClient({
  scrollRef,
  contentKey,
  visible,
  className,
}: ScrollProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const paint = useCallback((el: HTMLElement) => {
    if (barRef.current)
      barRef.current.style.transform = `scaleX(${Math.max(MIN_FILL, scrollProgress(el))})`;
  }, []);
  useScrollListener(scrollRef, contentKey, paint);

  return (
    <div
      aria-hidden="true"
      className={cx(track, className)}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <div ref={barRef} className={bar} />
    </div>
  );
}
