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
  transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
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
});

const capacityLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  flexShrink: 0,
  whiteSpace: 'nowrap',
});

const dropdownContainer = css({
  position: 'relative',
  flexShrink: 0,
});

const dropdownTrigger = css({
  minWidth: '90px',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1.5',
  textStyle: 'caption',
  '&:hover': { borderColor: 'color.primary' },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  maxHeight: '200px',
  overflowY: 'auto',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 30,
});

const dropdownOption = css({
  width: '100%',
  paddingY: '2',
  paddingX: '3',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textStyle: 'caption',
  color: 'color.text.primary',
  textAlign: 'left',
  '&:hover': { background: 'gray.50' },
});

const filterDivider = css({
  width: '1px',
  alignSelf: 'stretch',
  background: 'color.border.light',
  flexShrink: 0,
  marginX: '1',
});

const sortControl = css({
  display: 'flex',
  padding: '2px',
  borderRadius: 'radius.sm',
  background: 'gray.100',
  flexShrink: 0,
});

const sortItem = css({
  minHeight: '44px',
  paddingY: '1',
  paddingX: '2.5',
  borderRadius: 'radius.sm',
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  color: 'gray.600',
  textStyle: 'caption',
  fontWeight: 'medium',
  transition: 'background 0.15s ease, color 0.12s ease',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const sortItemActive = css({
  background: 'white',
  color: 'stellarBlue.500',
  fontWeight: 'semibold',
  boxShadow: 'shadow.sm',
  borderRadius: 'radius.sm',
});

const checkmark = css({
  color: 'color.primary',
});

export type CapacityFilter = 'all' | CapacityRange;

const CAPACITY_OPTIONS: { id: CapacityFilter; label: string }[] = [
  { id: 'all', label: '不限' },
  { id: '20以下', label: '20人以下' },
  { id: '20-40', label: '20-40人' },
  { id: '40-60', label: '40-60人' },
  { id: '60以上', label: '60人以上' },
];

export type VenueSort = 'eventCount' | 'newest';

const SORT_OPTIONS: { id: VenueSort; label: string }[] = [
  { id: 'eventCount', label: '最多生咖數' },
  { id: 'newest', label: '最新上架' },
];

interface VenueFiltersProps {
  regions: string[];
  region: string;
  onRegionChange: (region: string) => void;
  capacity: CapacityFilter;
  onCapacityChange: (capacity: CapacityFilter) => void;
  sort: VenueSort;
  onSortChange: (sort: VenueSort) => void;
}

export default function VenueFilters({
  regions,
  region,
  onRegionChange,
  capacity,
  onCapacityChange,
  sort,
  onSortChange,
}: VenueFiltersProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [capacityOpen, setCapacityOpen] = useState(false);
  const capacityRef = useRef<HTMLDivElement>(null);

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
    const handler = (e: MouseEvent) => {
      if (capacityRef.current && !capacityRef.current.contains(e.target as Node)) {
        setCapacityOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedCapacityLabel =
    CAPACITY_OPTIONS.find((opt) => opt.id === capacity)?.label ?? '不限';

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

        <div ref={capacityRef} className={dropdownContainer}>
          <button
            type="button"
            className={dropdownTrigger}
            aria-haspopup="menu"
            aria-expanded={capacityOpen}
            aria-labelledby="capacity-label"
            onClick={() => setCapacityOpen((o) => !o)}
          >
            <span>{selectedCapacityLabel}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              style={{
                transform: capacityOpen ? 'rotate(180deg)' : undefined,
                transition: 'transform 0.15s ease',
                flexShrink: 0,
              }}
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {capacityOpen && (
            <div className={dropdownMenu} role="menu" aria-labelledby="capacity-label">
              {CAPACITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={capacity === opt.id}
                  className={dropdownOption}
                  onClick={() => {
                    onCapacityChange(opt.id);
                    setCapacityOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {capacity === opt.id && <span className={checkmark}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={filterDivider} aria-hidden="true" />

        <div className={sortControl} role="group" aria-label="場地排序方式">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={sort === opt.id}
              className={`${sortItem} ${sort === opt.id ? sortItemActive : ''}`}
              onClick={() => onSortChange(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
