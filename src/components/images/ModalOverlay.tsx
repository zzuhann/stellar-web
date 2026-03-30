import { css } from '@/styled-system/css';

const modalOverlay = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'alpha.black.50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  padding: '4',
});

const ModalOverlay = ({ children }: { children: React.ReactNode }) => {
  return <div className={modalOverlay}>{children}</div>;
};

export default ModalOverlay;
