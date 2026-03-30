import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import ModalOverlay from './ModalOverlay';
import { css, cva } from '@/styled-system/css';

const modalContent = css({
  background: 'white',
  borderRadius: 'radius.lg',
  boxShadow:
    '0 20px 25px -5px var(--colors-alpha-black-10), 0 10px 10px -5px var(--colors-alpha-black-5)',
  maxWidth: '400px',
  width: '100%',
  overflow: 'hidden',
});

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '5',
  paddingX: '5',
  paddingBottom: '0',
});

const modalTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const closeButton = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '1',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
});

const modalBody = css({
  padding: '5',
});

const modalMessage = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  marginBottom: '5',
  marginTop: '0',
  marginX: '0',
});

const modalFooter = css({
  display: 'flex',
  gap: '3',
  paddingX: '5',
  paddingBottom: '5',
  paddingTop: '0',
});

const button = cva({
  base: {
    flex: 1,
    paddingY: '2.5',
    paddingX: '4',
    borderRadius: 'radius.lg',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
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
          background: 'red.700',
          borderColor: 'red.700',
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
  // 使用 focus trap hook
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} zIndex={50} padding="16px">
      <div
        ref={focusTrapRef}
        className={modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className={modalHeader}>
          <h3 id="confirm-modal-title" className={modalTitle}>
            <ExclamationTriangleIcon
              style={{ width: '20px', height: '20px', color: 'var(--colors-amber-500)' }}
              aria-hidden="true"
            />
            {title}
          </h3>
          <button className={closeButton} onClick={onCancel} aria-label="關閉對話框">
            <XMarkIcon aria-hidden="true" width={20} height={20} />
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
