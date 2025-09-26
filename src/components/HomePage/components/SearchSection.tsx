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
});

const searchInput = css({
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: 'color.text.primary',
  fontSize: '14px',
  outline: 'none',
  cursor: 'pointer',
  padding: '0',
  minHeight: '20px',
  display: 'flex',
  alignItems: 'center',
});

interface SearchSectionProps {
  onSearchClick: () => void;
}

export default function SearchSection({ onSearchClick }: SearchSectionProps) {
  return (
    <div className={container}>
      <MagnifyingGlassIcon width={20} height={20} color="var(--color-text-secondary)" />
      <div className={searchInput} onClick={onSearchClick}>
        搜尋你的偶像的生日應援
      </div>
    </div>
  );
}
