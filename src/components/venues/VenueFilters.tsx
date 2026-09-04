'use client';

import { useRef, useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import { useDebounce } from '@/hooks/useDebounce';
import { CAPACITY_OPTIONS, type CapacityFilter } from './venueCapacity';

export type { CapacityFilter };

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
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const dropdownContainer = css({
  position: 'relative',
  flexShrink: 0,
});

// 容納人數與排序共用同一顆 trigger 樣式（原本各自獨立，寬高不一致，2026-09 使用者裁定合併）。
// minWidth 108px 是排序原本的寬度（「綜合排序」四字所需），沿用給兩者；minHeight 44px 補上
// 容納人數原本缺的觸控目標（既有缺口，這次順便修掉，不用再單獨追蹤）。
const dropdownTrigger = css({
  minWidth: '108px',
  minHeight: '44px',
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
  minHeight: '44px',
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

const sortChevron = css({
  flexShrink: 0,
  transition: 'transform 0.15s ease',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
});

const sortDropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  minWidth: '200px',
  maxHeight: '240px',
  overflowY: 'auto',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 30,
  transformOrigin: 'top',
  animation: 'slideDown 0.18s ease-out',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

const sortDropdownOption = css({
  width: '100%',
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textStyle: 'caption',
  color: 'color.text.primary',
  textAlign: 'left',
  '&:hover': { background: 'gray.50' },
});

const checkmark = css({
  color: 'color.primary',
  flexShrink: 0,
});

// icon-only，接在 capacityRow 尾端（取代先前獨立一行的 clearFiltersRow），
// 只在 hasActiveFilters 為 true 時 render，維持 44x44 觸控目標。
const clearFiltersIconButton = css({
  minWidth: '44px',
  minHeight: '44px',
  flexShrink: 0,
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: 'stellarBlue.600',
  '&:hover': {
    background: 'gray.50',
  },
});

const clearFiltersIcon = css({
  width: '14px',
  height: '14px',
});

export type VenueSort = 'composite' | 'eventCount' | 'newest';

const SORT_OPTIONS: { id: VenueSort; label: string }[] = [
  { id: 'composite', label: '綜合排序' },
  { id: 'newest', label: '最新上架' },
  { id: 'eventCount', label: '生咖數最多' },
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
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedCapacityLabel =
    CAPACITY_OPTIONS.find((opt) => opt.id === capacity)?.label ?? '不限人數';
  const selectedSortOption = SORT_OPTIONS.find((opt) => opt.id === sort) ?? SORT_OPTIONS[0];

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
        <div ref={capacityRef} className={dropdownContainer}>
          <button
            type="button"
            className={dropdownTrigger}
            aria-haspopup="menu"
            aria-expanded={capacityOpen}
            aria-label="空間人數"
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
            <div className={dropdownMenu} role="menu" aria-label="空間人數">
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

        <div ref={sortRef} className={dropdownContainer}>
          <button
            type="button"
            className={dropdownTrigger}
            aria-haspopup="menu"
            aria-expanded={sortOpen}
            aria-label="排序"
            onClick={() => setSortOpen((o) => !o)}
          >
            <span>{selectedSortOption.label}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className={sortChevron}
              style={{ transform: sortOpen ? 'rotate(180deg)' : undefined }}
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

          {sortOpen && (
            <div className={sortDropdownMenu} role="menu" aria-label="排序">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sort === opt.id}
                  className={sortDropdownOption}
                  onClick={() => {
                    onSortChange(opt.id);
                    setSortOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {sort === opt.id && <span className={checkmark}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={clearFiltersIconButton}
            aria-label="清除篩選"
            onClick={() => {
              setSearchInput('');
              onClearFilters();
            }}
          >
            <ArrowPathIcon className={clearFiltersIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
