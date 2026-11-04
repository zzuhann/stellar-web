'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

type Measure<T> = (el: HTMLElement) => T;

// Last item's right edge vs the visible width, so end padding and spacers do not count as overflow
export const itemsOverflow =
  (itemSelector?: string): Measure<boolean> =>
  (el) => {
    const items = itemSelector ? el.querySelectorAll<HTMLElement>(itemSelector) : el.children;
    const last = items[items.length - 1];
    if (!last) return false;
    const contentRight =
      last.getBoundingClientRect().right - el.getBoundingClientRect().left + el.scrollLeft;
    return contentRight > el.clientWidth + 1;
  };

// Share of the content seen so far (right edge ÷ total), 1 at the end
export const scrollProgress: Measure<number> = ({ scrollLeft, clientWidth, scrollWidth }) =>
  scrollWidth > 0 ? Math.min(1, (scrollLeft + clientWidth) / scrollWidth) : 1;

// Runs onMeasure on mount, every scroll and container resize; onMeasure must be stable
export function useScrollListener(
  ref: RefObject<HTMLElement | null>,
  contentKey: unknown,
  onMeasure: (el: HTMLElement) => void
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => onMeasure(el);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [ref, contentKey, onMeasure]);
}

// State version for values that change rarely (e.g. overflow); measure must be stable (module-level)
export function useHorizontalScroll<T>(
  ref: RefObject<HTMLElement | null>,
  contentKey: unknown,
  measure: Measure<T>,
  initial: T
): T {
  const [value, setValue] = useState(initial);
  const update = useCallback((el: HTMLElement) => setValue(measure(el)), [measure]);
  useScrollListener(ref, contentKey, update);
  return value;
}
