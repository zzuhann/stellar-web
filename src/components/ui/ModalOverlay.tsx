import { cva } from '@/styled-system/css';

const modalOverlay = cva({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    isOpen: {
      true: {
        display: 'flex',
      },
      false: {
        display: 'none',
      },
    },
  },
});

type ModalOverlayProps = {
  isOpen: boolean;
  children: React.ReactNode;
  zIndex?: number;
  padding?: string;
  onClick?: () => void;
};

const ModalOverlay = ({
  children,
  isOpen,
  zIndex = 1000,
  padding = '20px',
  onClick,
}: ModalOverlayProps) => {
  return (
    <div className={modalOverlay({ isOpen })} style={{ zIndex, padding }} onClick={onClick}>
      {children}
    </div>
  );
};

export default ModalOverlay;
