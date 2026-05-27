'use client';

import { useRef, useState, useEffect } from 'react';
import { css } from '@/styled-system/css';
import type { CapacityRange } from '@/types';

const filterBar = css({
  position: 'sticky',
  top: '70px',
  zIndex: 20,
  background: 'alpha.white.90',
  backdropFilter: 'saturate(180%) blur(10px)',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  paddingTop: '2.5',
  paddingBottom: '3',
});

const regionWrap = css({
  position: 'relative',
});

const regionRow = css({
  display: 'flex',
  gap: '1.5',
  overflowX: 'auto',
  paddingX: '4',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const regionFadeLeft = css({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  width: '32px',
  background: 'linear-gradient(to right, rgba(255,255,255,0.96), rgba(255,255,255,0))',
  pointerEvents: 'none',
  transition: 'opacity 0.18s ease-out',
});

const regionFadeRight = css({
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  width: '32px',
  background: 'linear-gradient(to left, rgba(255,255,255,0.96), rgba(255,255,255,0))',
  pointerEvents: 'none',
  transition: 'opacity 0.18s ease-out',
});

const regionChip = css({
  flexShrink: 0,
  paddingY: '2',
  paddingX: '3',
  borderRadius: '999px',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const regionChipActive = css({
  borderColor: 'color.primary',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  fontWeight: 'semibold',
});

const capacityRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  paddingX: '4',
  marginTop: '2.5',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const capacityLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  flexShrink: 0,
  whiteSpace: 'nowrap',
});

const segmented = css({
  display: 'flex',
  gap: '1',
  padding: '0.5',
  borderRadius: 'radius.lg',
  background: 'gray.100',
  flexShrink: 0,
  position: 'relative',
});

const segItem = css({
  paddingY: '1',
  paddingX: '2.5',
  borderRadius: 'radius.md',
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  color: 'color.text.secondary',
  textStyle: 'caption',
  fontWeight: 'medium',
  transition: 'color 0.2s ease',
  whiteSpace: 'nowrap',
  position: 'relative',
  zIndex: 1,
});

const segItemActive = css({
  color: 'white',
  fontWeight: 'semibold',
});

const segSlider = css({
  position: 'absolute',
  top: '0.5',
  bottom: '0.5',
  borderRadius: 'radius.md',
  background: 'stellarBlue.500',
  transition: 'all 0.2s ease',
  pointerEvents: 'none',
  zIndex: 0,
});

export type CapacityFilter = 'all' | CapacityRange;

const CAPACITY_OPTIONS: { id: CapacityFilter; label: string }[] = [
  { id: 'all', label: '不限' },
  { id: '20以下', label: '20人以下' },
  { id: '20-40', label: '20-40人' },
  { id: '40-60', label: '40-60人' },
  { id: '60以上', label: '60人以上' },
];

interface VenueFiltersProps {
  regions: string[];
  region: string;
  onRegionChange: (region: string) => void;
  capacity: CapacityFilter;
  onCapacityChange: (capacity: CapacityFilter) => void;
}

export default function VenueFilters({
  regions,
  region,
  onRegionChange,
  capacity,
  onCapacityChange,
}: VenueFiltersProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateFades = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateFades();
    const el = rowRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateFades);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const activeIndex = CAPACITY_OPTIONS.findIndex((opt) => opt.id === capacity);
    const activeBtn = buttonRefs.current[activeIndex];
    if (!activeBtn) return;
    setSliderStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
  }, [capacity]);

  return (
    <div className={filterBar}>
      <div className={regionWrap}>
        <div ref={rowRef} className={regionRow} onScroll={updateFades}>
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={region === r}
              className={`${regionChip} ${region === r ? regionChipActive : ''}`}
              onClick={() => onRegionChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className={regionFadeLeft} aria-hidden="true" style={{ opacity: showLeft ? 1 : 0 }} />
        <div
          className={regionFadeRight}
          aria-hidden="true"
          style={{ opacity: showRight ? 1 : 0 }}
        />
      </div>

      <div className={capacityRow}>
        <span id="capacity-label" className={capacityLabel}>
          空間人數
        </span>
        <div className={segmented} role="group" aria-labelledby="capacity-label">
          <div
            className={segSlider}
            aria-hidden="true"
            style={{ left: sliderStyle.left, width: sliderStyle.width }}
          />
          {CAPACITY_OPTIONS.map((opt, index) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={capacity === opt.id}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              className={`${segItem} ${capacity === opt.id ? segItemActive : ''}`}
              onClick={() => onCapacityChange(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
