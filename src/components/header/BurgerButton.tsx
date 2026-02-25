import { css } from '@/styled-system/css';
import { Bars3Icon } from '@heroicons/react/24/outline';

const burgerButton = css({
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'color.text.primary',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: 'radius.sm',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '@media (max-width: 768px)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type BurgerButtonProps = {
  onClick: () => void;
  ariaExpanded?: boolean;
  ariaLabel?: string;
};

const BurgerButton = ({ onClick, ariaExpanded, ariaLabel = '開啟選單' }: BurgerButtonProps) => {
  return (
    <button
      type="button"
      className={burgerButton}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-label={ariaLabel}
    >
      <Bars3Icon width={24} height={24} aria-hidden="true" />
    </button>
  );
};

export default BurgerButton;
