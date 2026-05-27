'use client';

import { useRef, useState, useEffect } from 'react';
import { css } from '@/styled-system/css';
import type { CapacityRange } from '@/types';

const filterBar = css({
  position: 'sticky',
  top: '70px',
  zIndex: 20,
  background: 'rgba(255,255,255,0.96)',
  backdropFilter: 'saturate(180%) blur(10px)',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  paddingTop: '10px',
  paddingBottom: '12px',
});

const regionWrap = css({
  position: 'relative',
});

const regionRow = css({
  display: 'flex',
  gap: '6px',
  overflowX: 'auto',
  paddingX: '16px',
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
  padding: '7px 14px',
  borderRadius: '999px',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const regionChipActive = css({
  borderColor: 'color.primary',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  fontWeight: 600,
});

const capacityRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingX: '16px',
  marginTop: '10px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const capacityLabel = css({
  fontSize: '12px',
  color: 'color.text.secondary',
  flexShrink: 0,
  whiteSpace: 'nowrap',
});

const segmented = css({
  display: 'flex',
  gap: '4px',
  padding: '3px',
  borderRadius: 'radius.lg',
  background: 'gray.100',
  flexShrink: 0,
});

const segItem = css({
  padding: '5px 10px',
  borderRadius: 'radius.md',
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  color: 'color.text.secondary',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
});

const segItemActive = css({
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontWeight: 600,
  boxShadow: 'shadow.sm',
});

const REGIONS = ['全部', '台北', '新北', '桃園', '台中', '台南', '高雄'];

export type CapacityFilter = 'all' | CapacityRange;

const CAPACITY_OPTIONS: { id: CapacityFilter; label: string }[] = [
  { id: 'all', label: '不限' },
  { id: '20以下', label: '20人以下' },
  { id: '20-40', label: '20-40人' },
  { id: '40-60', label: '40-60人' },
  { id: '60以上', label: '60人以上' },
];

interface VenueFiltersProps {
  region: string;
  onRegionChange: (region: string) => void;
  capacity: CapacityFilter;
  onCapacityChange: (capacity: CapacityFilter) => void;
}

export default function VenueFilters({
  region,
  onRegionChange,
  capacity,
  onCapacityChange,
}: VenueFiltersProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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

  return (
    <div className={filterBar}>
      <div className={regionWrap}>
        <div ref={rowRef} className={regionRow} onScroll={updateFades}>
          {REGIONS.map((r) => (
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
          {CAPACITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={capacity === opt.id}
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
