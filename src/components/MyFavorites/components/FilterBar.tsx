import { useState, useRef, useEffect } from 'react';
import { css } from '@/styled-system/css';
import { SortByOption } from '../queryState';

const filterBarContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  padding: '4',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
});

const filterRow = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const dropdownContainer = css({
  position: 'relative',
  flex: 1,
});

const dropdownButton = css({
  textStyle: 'bodySmall',
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: 'color.primary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: 'shadow.sm',
  },
});

const dropdownArrow = css({
  display: 'inline-block',
  transition: 'transform 0.2s ease',
});

const dropdownArrowOpen = css({
  transform: 'rotate(180deg)',
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 10,
  overflow: 'hidden',
  transformOrigin: 'top',
  animation: 'slideDown 0.2s ease-out',
});

const dropdownOption = css({
  textStyle: 'bodySmall',
  paddingY: '2.5',
  paddingX: '3',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'background 0.15s',
  width: '100%',
  '&:hover': {
    background: 'gray.50',
  },
});

const dropdownOptionSelected = css({
  color: 'color.primary',
  fontWeight: 'medium',
});

const checkbox = css({
  width: '16px',
  height: '16px',
  cursor: 'pointer',
});

const checkboxLabel = css({
  textStyle: 'bodySmall',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  color: 'color.text.primary',
  cursor: 'pointer',
  userSelect: 'none',
});

type FilterBarProps = {
  showOnlyActive: boolean;
  onShowOnlyActiveChange: (show: boolean) => void;
  sortBy: SortByOption;
  onSortByChange: (sortBy: SortByOption) => void;
};

const FilterBar = ({
  showOnlyActive,
  onShowOnlyActiveChange,
  sortBy,
  onSortByChange,
}: FilterBarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 排序選項
  const sortOptions = [
    { value: 'favorited-desc' as const, label: '收藏時間：由新到舊' },
    { value: 'favorited-asc' as const, label: '收藏時間：由舊到新' },
    { value: 'startTime-asc' as const, label: '活動時間：由早到晚' },
    { value: 'startTime-desc' as const, label: '活動時間：由晚到早' },
  ];

  const currentOption = sortOptions.find((opt) => opt.value === sortBy);

  const handleOptionSelect = (value: SortByOption) => {
    onSortByChange(value);
    setIsDropdownOpen(false);
  };

  // 點擊外部關閉 dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 鍵盤操作
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }

    const currentIndex = sortOptions.findIndex((opt) => opt.value === sortBy);

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsDropdownOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < sortOptions.length - 1) {
          onSortByChange(sortOptions[currentIndex + 1].value);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          onSortByChange(sortOptions[currentIndex - 1].value);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsDropdownOpen(false);
        break;
    }
  };

  return (
    <div className={filterBarContainer}>
      <div className={filterRow}>
        <label className={checkboxLabel}>
          <input
            type="checkbox"
            className={checkbox}
            checked={showOnlyActive}
            onChange={(e) => onShowOnlyActiveChange(e.target.checked)}
          />
          <span>只顯示未結束的應援</span>
        </label>
      </div>

      <div className={filterRow}>
        <div className={dropdownContainer} ref={dropdownRef}>
          <button
            type="button"
            className={dropdownButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={handleKeyDown}
            aria-label="選擇排序方式"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <span>{currentOption?.label}</span>
            <span className={`${dropdownArrow} ${isDropdownOpen ? dropdownArrowOpen : ''}`}>▼</span>
          </button>

          {isDropdownOpen && (
            <div className={dropdownMenu} role="listbox" aria-label="排序選項">
              {sortOptions.map((option) => {
                const isSelected = option.value === sortBy;
                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`${dropdownOption} ${isSelected ? dropdownOptionSelected : ''}`}
                    onClick={() => handleOptionSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={option.label}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span> ✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
