'use client';

import { useRef, useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useDebounce } from '@/hooks/useDebounce';
import { CAPACITY_OPTIONS, type CapacityFilter } from './venueCapacity';

export type { CapacityFilter };

// 800ms 對齊 PlaceAutocomplete.tsx / ArtistSearchModal.tsx 既有的搜尋 debounce，
// 統一使用者對搜尋反應速度的預期（2026-08-03 使用者裁定，原 300ms 改為 800ms）。
const SEARCH_DEBOUNCE_MS = 800;

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

const searchRow = css({
  paddingX: '4',
  marginBottom: '2.5',
});

const searchFieldWrap = css({
  position: 'relative',
});

const searchFieldIcon = css({
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '16px',
  height: '16px',
  color: 'color.text.secondary',
  pointerEvents: 'none',
});

const searchFieldInput = css({
  width: '100%',
  minHeight: '44px',
  paddingLeft: '9',
  paddingRight: '9',
  paddingY: '2',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  '&::placeholder': {
    color: 'color.text.tertiary',
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
  },
});

const searchFieldClear = css({
  position: 'absolute',
  right: '4px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'color.text.secondary',
  borderRadius: 'radius.sm',
  '&:hover': {
    color: 'color.text.primary',
  },
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

const clearFiltersRow = css({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingX: '4',
  marginTop: '1.5',
});

const clearFiltersButton = css({
  minHeight: '44px',
  paddingX: '3',
  display: 'inline-flex',
  alignItems: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'stellarBlue.600',
  textStyle: 'caption',
  fontWeight: 'medium',
  '&:hover': {
    textDecoration: 'underline',
  },
});

export type VenueSort = 'eventCount' | 'newest';

// 2026-08-03 使用者裁定：`newest`/最新上架排第一、且為預設值，對齊正式上線既有行為
// （design-frontend.md 先前寫的 eventCount 預設是文件與實作間的既有 drift，這次修正
// 文件對齊實際行為，而非反向把實作改成文件寫的樣子）。
const SORT_OPTIONS: { id: VenueSort; label: string }[] = [
  { id: 'newest', label: '最新上架' },
  { id: 'eventCount', label: '最多收錄生咖' },
];

interface VenueFiltersProps {
  regions: string[];
  region: string;
  onRegionChange: (region: string) => void;
  capacity: CapacityFilter;
  onCapacityChange: (capacity: CapacityFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  sort: VenueSort;
  onSortChange: (sort: VenueSort) => void;
  onClearFilters: () => void;
}

export default function VenueFilters({
  regions,
  region,
  onRegionChange,
  capacity,
  onCapacityChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onClearFilters,
}: VenueFiltersProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [capacityOpen, setCapacityOpen] = useState(false);
  const capacityRef = useRef<HTMLDivElement>(null);

  // Raw input shown immediately; only the debounced value flows up to the URL/query.
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const isFirstRender = useRef(true);
  const onSearchChangeRef = useRef(onSearchChange);

  // Sync when `search` changes externally (e.g. browser back/forward navigation).
  // Adjusting state during render (React-endorsed pattern for derived-from-props
  // state) instead of an effect, to avoid an extra render pass.
  const [prevSearchProp, setPrevSearchProp] = useState(search);
  if (prevSearchProp !== search) {
    setPrevSearchProp(search);
    setSearchInput(search);
  }

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearchChangeRef.current(debouncedSearch);
  }, [debouncedSearch]);

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

  // 用即時的 searchInput（而非 debounce 後才寫入 URL 的 search prop），讓按鈕出現/
  // 消失的時機跟輸入框本身一樣即時，不需要等 800ms debounce 結束。
  const hasActiveFilters = region !== '全部' || capacity !== 'all' || searchInput !== '';

  return (
    <div className={filterBar}>
      <div className={searchRow}>
        <div className={searchFieldWrap}>
          <MagnifyingGlassIcon className={searchFieldIcon} aria-hidden="true" />
          <input
            type="search"
            className={searchFieldInput}
            placeholder="搜尋場地名稱"
            aria-label="搜尋場地名稱"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className={searchFieldClear}
              aria-label="清除搜尋"
              onClick={() => setSearchInput('')}
            >
              <XMarkIcon width={16} height={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

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

      {hasActiveFilters && (
        <div className={clearFiltersRow}>
          <button
            type="button"
            className={clearFiltersButton}
            onClick={() => {
              setSearchInput('');
              onClearFilters();
            }}
          >
            清除篩選
          </button>
        </div>
      )}
    </div>
  );
}
