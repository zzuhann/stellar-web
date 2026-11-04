'use client';

import type { RefObject } from 'react';
import { css, cx } from '@/styled-system/css';
import { scrollProgress, useHorizontalScroll } from '@/hooks/useHorizontalScroll';

const track = css({
  height: '3px',
  borderRadius: '2px',
  background: 'gray.100',
  overflow: 'hidden',
});

const bar = css({
  height: '100%',
  borderRadius: '2px',
  background: 'color.primary',
  transition: 'width 0.18s ease-out',
});

interface ScrollProgressBarProps {
  scrollRef: RefObject<HTMLElement | null>;
  contentKey: unknown;
  visible: boolean;
  className?: string;
}

// Stands in for the hidden native scrollbar; always takes its 3px so showing it never shifts layout.
// Owns its scroll subscription so only the bar re-renders while scrolling.
export default function ScrollProgressBar({
  scrollRef,
  contentKey,
  visible,
  className,
}: ScrollProgressBarProps) {
  const progress = useHorizontalScroll(scrollRef, contentKey, scrollProgress, 1);

  return (
    <div
      aria-hidden="true"
      className={cx(track, className)}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <div className={bar} style={{ width: `${Math.max(8, progress * 100)}%` }} />
    </div>
  );
}
