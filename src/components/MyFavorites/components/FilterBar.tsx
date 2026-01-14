import { useState, useRef, useEffect } from 'react';
import { css } from '@/styled-system/css';
import { SortByOption } from '../queryState';

const filterBarContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
});

const filterRow = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const dropdownContainer = css({
  position: 'relative',
  flex: 1,
});

const dropdownButton = css({
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  fontSize: '14px',
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
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
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
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  zIndex: 10,
  overflow: 'hidden',
  transformOrigin: 'top',
  animation: 'slideDown 0.2s ease-out',
});

const dropdownOption = css({
  padding: '10px 12px',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'background 0.15s',
  '&:hover': {
    background: '#f3f4f6',
  },
});

const dropdownOptionSelected = css({
  color: 'color.primary',
  fontWeight: '500',
});

const checkbox = css({
  width: '16px',
  height: '16px',
  cursor: 'pointer',
});

const checkboxLabel = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
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
                  <div
                    key={option.value}
                    className={`${dropdownOption} ${isSelected ? dropdownOptionSelected : ''}`}
                    onClick={() => handleOptionSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span>✓</span>}
                  </div>
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
