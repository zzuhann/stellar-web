'use client';

import { useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import ModalOverlay from '@/components/ui/ModalOverlay';
import type { Venue } from '@/types';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const dialogBox = css({
  background: 'white',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  maxWidth: '420px',
  width: '100%',
  overflow: 'hidden',
});

const dialogHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '5',
  paddingTop: '5',
  paddingBottom: '3',
});

const dialogTitle = css({
  textStyle: 'h4',
  color: 'color.text.primary',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const dialogCloseBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '1',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const dialogBody = css({
  paddingX: '5',
  paddingBottom: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const inlineError = css({
  paddingX: '5',
  paddingBottom: '2',
  textStyle: 'caption',
  color: 'red.600',
});

const dialogFooter = css({
  display: 'flex',
  gap: '2',
  paddingX: '5',
  paddingBottom: '5',
  paddingTop: '2',
});

const dialogBtn = cva({
  base: {
    flex: 1,
    paddingY: '2.5',
    paddingX: '4',
    borderRadius: 'radius.md',
    border: '1px solid',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    transition: 'background 0.15s ease',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      cancel: {
        background: 'white',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': {
          background: 'color.background.secondary',
        },
      },
      destructive: {
        background: 'red.600',
        borderColor: 'red.600',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: 'red.700',
          borderColor: 'red.700',
        },
      },
    },
  },
});

const spinner = css({
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTopColor: 'white',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
});

// ─── Interface ────────────────────────────────────────────────────────────────

interface DeleteVenueDialogProps {
  venue: Venue | null;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeleteVenueDialog({
  venue,
  onConfirm,
  onClose,
  isLoading,
  error,
}: DeleteVenueDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isLoading, onClose]);

  if (venue === null) return null;

  return (
    <ModalOverlay isOpen zIndex={50} padding="16px">
      <div
        className={dialogBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-venue-dialog-title"
      >
        <div className={dialogHeader}>
          <h3 id="delete-venue-dialog-title" className={dialogTitle}>
            <ExclamationTriangleIcon
              className={css({ width: '20px', height: '20px', color: 'amber.500' })}
              aria-hidden="true"
            />
            確認永久刪除場地？
          </h3>
          <button
            className={dialogCloseBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="關閉"
            type="button"
          >
            <XMarkIcon width={20} height={20} aria-hidden="true" />
          </button>
        </div>
        <div className={dialogBody}>
          <p>
            此操作無法復原。場地資料將從系統中完全移除。若該場地有關聯的活動紀錄，系統將拒絕刪除。
          </p>
        </div>
        {error && (
          <div className={inlineError} role="alert">
            {error}
          </div>
        )}
        <div className={dialogFooter}>
          <button
            className={dialogBtn({ variant: 'cancel' })}
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            取消
          </button>
          <button
            className={dialogBtn({ variant: 'destructive' })}
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading && <div className={spinner} aria-hidden="true" />}
            永久刪除
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
