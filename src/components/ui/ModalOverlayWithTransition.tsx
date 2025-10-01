import { cva } from '@/styled-system/css';

const modalOverlay = cva({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px',
    transition: 'opacity 0.3s ease, visibility 0.3s ease-out',
  },
  variants: {
    isOpen: {
      true: {
        opacity: 1,
        visibility: 'visible',
      },
      false: {
        opacity: 0,
        visibility: 'hidden',
      },
    },
  },
});

type ModalOverlayWithTransitionProps = {
  isOpen: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

const ModalOverlayWithTransition = ({
  children,
  isOpen,
  onClick,
}: ModalOverlayWithTransitionProps) => {
  return (
    <div className={modalOverlay({ isOpen })} onClick={onClick}>
      {children}
    </div>
  );
};

export default ModalOverlayWithTransition;
