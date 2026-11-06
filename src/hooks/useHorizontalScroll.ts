'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

// Last item's right edge vs the visible width, so end padding and spacers do not count as overflow
export const itemsOverflow = (el: HTMLElement, itemSelector?: string): boolean => {
  const items = itemSelector ? el.querySelectorAll<HTMLElement>(itemSelector) : el.children;
  const last = items[items.length - 1];
  if (!last) return false;
  const contentRight =
    last.getBoundingClientRect().right - el.getBoundingClientRect().left + el.scrollLeft;
  return contentRight > el.clientWidth + 1;
};

// Share of the content seen so far (right edge ÷ total); within 1px of the end counts as 1,
// since fractional scrollLeft on high-DPR or zoomed screens can stop just short
export const scrollProgress = ({ scrollLeft, clientWidth, scrollWidth }: HTMLElement): number =>
  scrollLeft + clientWidth >= scrollWidth - 1 ? 1 : (scrollLeft + clientWidth) / scrollWidth;

// Runs onMeasure on mount, container resize and (optionally) every scroll; onMeasure must be stable.
// Layout effect so the first measure lands before paint.
export function useScrollListener(
  ref: RefObject<HTMLElement | null>,
  contentKey: unknown,
  onMeasure: (el: HTMLElement) => void,
  listenToScroll = true
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => onMeasure(el);
    update();
    if (listenToScroll) el.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [ref, contentKey, onMeasure, listenToScroll]);
}

// Overflow does not depend on scroll position, so it is only re-measured on resize / content change
export function useHorizontalOverflow(
  ref: RefObject<HTMLElement | null>,
  contentKey: unknown,
  itemSelector?: string
): boolean {
  const [overflows, setOverflows] = useState(false);
  const measure = useCallback(
    (el: HTMLElement) => setOverflows(itemsOverflow(el, itemSelector)),
    [itemSelector]
  );
  useScrollListener(ref, contentKey, measure, false);
  return overflows;
}
