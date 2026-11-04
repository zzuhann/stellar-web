'use client';

import { useEffect, useState, type RefObject } from 'react';

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

// Share of the content seen so far (right edge ÷ total), 1 at the end; rounded to skip no-op renders
export const scrollProgress: Measure<number> = ({ scrollLeft, clientWidth, scrollWidth }) =>
  scrollWidth > 0
    ? Math.round(Math.min(1, (scrollLeft + clientWidth) / scrollWidth) * 100) / 100
    : 1;

// Re-measures on scroll and container resize; measure must be stable (module-level)
export function useHorizontalScroll<T>(
  ref: RefObject<HTMLElement | null>,
  contentKey: unknown,
  measure: Measure<T>,
  initial: T
): T {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setValue(measure(el));
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [ref, contentKey, measure]);

  return value;
}
