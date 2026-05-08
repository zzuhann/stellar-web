'use client';

import { useEffect, useRef, useState } from 'react';
import { css } from '@/styled-system/css';

type StatCounterProps = {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
};

const wrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  alignItems: 'center',
});

const numberStyle = css({
  textStyle: 'h1',
  color: 'color.text.primary',
  lineHeight: '1',
});

const labelStyle = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.05em',
});

const StatCounter = ({ target, suffix = '', label, duration = 1500 }: StatCounterProps) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let raf: number;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      raf = requestAnimationFrame(() => setCount(target));
      return () => cancelAnimationFrame(raf);
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return (
    <div ref={ref} className={wrapper}>
      <span className={numberStyle}>
        {count}
        {suffix}
      </span>
      <span className={labelStyle}>{label}</span>
    </div>
  );
};

export default StatCounter;
