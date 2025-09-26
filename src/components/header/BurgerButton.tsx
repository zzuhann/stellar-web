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
    background: 'color.bg.secondary',
  },
  '@media (max-width: 768px)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type BurgerButtonProps = {
  onClick: () => void;
};

const BurgerButton = ({ onClick }: BurgerButtonProps) => {
  return (
    <div className={burgerButton} onClick={onClick}>
      <Bars3Icon width={24} height={24} />
    </div>
  );
};

export default BurgerButton;
