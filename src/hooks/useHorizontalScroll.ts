'use client';

import { useEffect, useState, type RefObject } from 'react';

// progress = share of the content seen so far (right edge ÷ total), 1 at the end
export function useHorizontalScroll(ref: RefObject<HTMLElement | null>, contentKey: unknown) {
  const [state, setState] = useState({ overflows: false, progress: 1 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft, clientWidth, scrollWidth } = el;
      setState({
        overflows: scrollWidth - clientWidth > 1,
        progress: scrollWidth > 0 ? Math.min(1, (scrollLeft + clientWidth) / scrollWidth) : 1,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [ref, contentKey]);

  return state;
}
