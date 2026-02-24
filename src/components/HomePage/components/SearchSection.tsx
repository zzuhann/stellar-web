import { forwardRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

const container = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '8px 16px',
  marginTop: '8px',
  appearance: 'none',
  margin: 0,
  font: 'inherit',
  textAlign: 'left',
  width: '100%',
  cursor: 'pointer',
});

const searchInput = css({
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: 'color.text.primary',
  fontSize: '14px',
  outline: 'none',
  padding: '0',
  minHeight: '20px',
  display: 'flex',
  alignItems: 'center',
});

interface SearchSectionProps {
  onSearchClick: () => void;
}

const SearchSection = forwardRef<HTMLButtonElement, SearchSectionProps>(function SearchSection(
  { onSearchClick },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={container}
      onClick={onSearchClick}
      aria-label="搜尋你的偶像的生日應援"
    >
      <MagnifyingGlassIcon width={20} height={20} color="var(--color-text-secondary)" aria-hidden />
      <span className={searchInput}>搜尋你的偶像的生日應援</span>
    </button>
  );
});

export default SearchSection;
