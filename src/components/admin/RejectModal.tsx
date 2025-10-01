'use client';

import { useState, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import ModalOverlay from '../ui/ModalOverlay';

interface RejectModalProps {
  isOpen: boolean;
  title: string;
  itemName: string; // 藝人名稱或活動標題
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading?: boolean;
}

const modalContainer = css({
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
});

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: 0,
});

const closeButton = css({
  padding: '4px',
  border: 'none',
  background: 'none',
  color: 'color.text.secondary',
  cursor: 'pointer',
  borderRadius: 'radius.sm',
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
  padding: '24px',
});

const itemInfo = css({
  marginBottom: '20px',
  padding: '12px 16px',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
});

const itemLabel = css({
  fontSize: '12px',
  fontWeight: '600',
  color: 'color.text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  marginBottom: '4px',
});

const styledItemName = css({
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
});

const formGroup = css({
  marginBottom: '20px',
});

const label = css({
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
  marginBottom: '8px',
});

const requiredIndicator = css({
  color: '#dc2626',
  marginLeft: '4px',
});

const textarea = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '16px',
  fontFamily: 'inherit',
  lineHeight: '1.5',
  resize: 'vertical',
  minHeight: '120px',
  transition: 'all 0.2s ease',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
});

const helperText = css({
  fontSize: '12px',
  color: 'color.text.secondary',
  marginTop: '6px',
});

const errorText = css({
  fontSize: '12px',
  color: '#dc2626',
  marginTop: '6px',
});

const characterCount = cva({
  base: {
    fontSize: '11px',
    textAlign: 'right',
    marginTop: '4px',
  },
  variants: {
    isNearLimit: {
      true: {
        color: '#dc2626',
      },
      false: {
        color: 'color.text.secondary',
      },
    },
  },
});

const modalFooter = css({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  padding: '20px 24px',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const button = cva({
  base: {
    padding: '10px 20px',
    borderRadius: 'radius.md',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  variants: {
    variant: {
      primary: {
        background: '#dc2626',
        borderColor: '#dc2626',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: '#b91c1c',
          borderColor: '#b91c1c',
        },
        '&:disabled': {
          background: 'color.text.disabled',
          borderColor: 'color.text.disabled',
          cursor: 'not-allowed',
        },
      },
      secondary: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
        },
      },
    },
  },
});

const loadingSpinner = css({
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
});

const MAX_REASON_LENGTH = 500;

export default function RejectModal({
  isOpen,
  title,
  itemName,
  onConfirm,
  onClose,
  loading = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (!reason.trim()) {
      setError('請填寫拒絕原因');
      return;
    }

    if (reason.length > MAX_REASON_LENGTH) {
      setError(`拒絕原因不能超過 ${MAX_REASON_LENGTH} 字元`);
      return;
    }

    onConfirm(reason.trim());
  }, [reason, onConfirm]);

  const handleReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    if (!loading) {
      setReason('');
      setError('');
      onClose();
    }
  }, [loading, onClose]);

  if (!isOpen) return null;

  const isNearLimit = reason.length > MAX_REASON_LENGTH * 0.8;
  const isOverLimit = reason.length > MAX_REASON_LENGTH;

  return (
    <ModalOverlay isOpen={isOpen} zIndex={50} padding="16px">
      <div className={modalContainer}>
        <div className={modalHeader}>
          <h2 className={modalTitle}>{title}</h2>
          <button className={closeButton} onClick={handleClose} disabled={loading}>
            <XMarkIcon />
          </button>
        </div>

        <div className={modalBody}>
          <div className={itemInfo}>
            <div className={itemLabel}>項目</div>
            <div className={styledItemName}>{itemName}</div>
          </div>

          <div className={formGroup}>
            <label className={label}>
              拒絕原因
              <span className={requiredIndicator}>*</span>
            </label>
            <textarea
              className={textarea}
              value={reason}
              onChange={handleReasonChange}
              placeholder="請說明拒絕的原因，幫助投稿者了解如何改進..."
              disabled={loading}
            />
            <div className={characterCount({ isNearLimit })}>
              {reason.length}/{MAX_REASON_LENGTH}
            </div>
            {error && <div className={errorText}>{error}</div>}
            {!error && (
              <div className={helperText}>
                請清楚說明拒絕原因，幫助投稿者改進內容以符合平台規範。
              </div>
            )}
          </div>
        </div>

        <div className={modalFooter}>
          <button
            className={button({ variant: 'secondary' })}
            onClick={handleClose}
            disabled={loading}
          >
            取消
          </button>
          <button
            className={button({ variant: 'primary' })}
            onClick={handleSubmit}
            disabled={loading || !reason.trim() || isOverLimit}
          >
            {loading && <div className={loadingSpinner} />}
            確認拒絕
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
