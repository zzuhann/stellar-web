import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useScrollLock } from '@/hooks/useScrollLock';
import ModalOverlay from './ModalOverlay';
import { css, cva } from '@/styled-system/css';

const modalContent = css({
  background: 'white',
  borderRadius: 'radius.lg',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  maxWidth: '400px',
  width: '100%',
  overflow: 'hidden',
});

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 20px 0 20px',
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const closeButton = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
  '& svg': {
    width: '20px',
    height: '20px',
  },
});

const modalBody = css({
  padding: '20px',
});

const modalMessage = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0 0 20px 0',
  lineHeight: '1.5',
});

const modalFooter = css({
  display: 'flex',
  gap: '12px',
  padding: '0 20px 20px 20px',
});

const button = cva({
  base: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 'radius.lg',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      cancel: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
        },
      },
      confirm: {
        background: 'color.status.error',
        borderColor: 'color.status.error',
        color: 'white',
        '&:hover': {
          background: '#b91c1c',
          borderColor: '#b91c1c',
        },
      },
    },
  },
});

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '確認',
  cancelText = '取消',
  isLoading = false,
}: ConfirmModalProps) {
  // 使用 scroll lock hook
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} zIndex={50} padding="16px">
      <div className={modalContent}>
        <div className={modalHeader}>
          <h3 className={modalTitle}>
            <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#eab308' }} />
            {title}
          </h3>
          <button className={closeButton} onClick={onCancel}>
            <XMarkIcon />
          </button>
        </div>
        <div className={modalBody}>
          <p className={modalMessage}>{message}</p>
        </div>
        <div className={modalFooter}>
          <button className={button({ variant: 'cancel' })} onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </button>
          <button
            className={button({ variant: 'confirm' })}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '處理中...' : confirmText}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
