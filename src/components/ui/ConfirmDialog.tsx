'use client';

import type { ReactNode } from 'react';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const dialogRoot = css({
  position: 'relative',
  zIndex: 50,
});

const backdrop = css({
  position: 'fixed',
  inset: 0,
  background: 'alpha.black.50',
});

const panelWrapper = css({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4',
});

const dialogBox = cva({
  base: {
    background: 'white',
    borderRadius: 'radius.lg',
    boxShadow: 'shadow.lg',
    maxWidth: '420px',
    width: '100%',
    overflow: 'hidden',
  },
  variants: {
    // Only with children: long content scrolls inside the panel, footer stays put
    withContent: {
      true: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '480px',
        maxHeight: 'calc(100dvh - token(spacing.8))',
      },
    },
  },
});

const scrollBody = css({
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
});

const dialogHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '5',
  paddingTop: '5',
  paddingBottom: '3',
});

const dialogTitleStyle = css({
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
  '&:hover': { background: 'color.background.secondary', color: 'color.text.primary' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
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

const dialogFooter = cva({
  base: {
    display: 'flex',
    gap: '2',
    paddingX: '5',
    paddingBottom: '5',
    paddingTop: '2',
  },
  variants: {
    withContent: {
      true: {
        flexShrink: 0,
        paddingBottom: 'calc(token(spacing.5) + env(safe-area-inset-bottom))',
      },
    },
  },
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
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
  variants: {
    variant: {
      cancel: {
        background: 'white',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': { background: 'color.background.secondary' },
      },
      destructive: {
        background: 'red.600',
        borderColor: 'red.600',
        color: 'white',
        '&:hover:not(:disabled)': { background: 'red.700', borderColor: 'red.700' },
      },
      primary: {
        background: 'stellarBlue.600',
        borderColor: 'stellarBlue.600',
        color: 'white',
        '&:hover:not(:disabled)': { background: 'stellarBlue.700', borderColor: 'stellarBlue.700' },
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

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'destructive' | 'primary';
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
  // Optional rich content under the description; scrolls inside the dialog when tall
  children?: ReactNode;
  confirmDisabled?: boolean;
  // Safer initial focus for dialogs whose confirm action is hard to undo
  autoFocusCancel?: boolean;
  confirmDescribedBy?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = 'destructive',
  cancelLabel = '取消',
  onConfirm,
  onClose,
  isLoading = false,
  error,
  children,
  confirmDisabled = false,
  autoFocusCancel = false,
  confirmDescribedBy,
}: ConfirmDialogProps) {
  function handleClose() {
    if (!isLoading) onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} role="alertdialog" className={dialogRoot}>
      <DialogBackdrop className={backdrop} />
      <div className={panelWrapper}>
        <DialogPanel className={dialogBox({ withContent: Boolean(children) })}>
          <div className={dialogHeader}>
            <DialogTitle className={dialogTitleStyle}>
              <ExclamationTriangleIcon
                className={css({ width: '20px', height: '20px', color: 'amber.500' })}
                aria-hidden="true"
              />
              {title}
            </DialogTitle>
            <button
              type="button"
              className={dialogCloseBtn}
              onClick={handleClose}
              disabled={isLoading}
              aria-label="關閉"
            >
              <XMarkIcon width={20} height={20} aria-hidden="true" />
            </button>
          </div>
          {children ? (
            <div className={scrollBody}>
              <Description className={dialogBody}>{description}</Description>
              {children}
            </div>
          ) : (
            <Description className={dialogBody}>{description}</Description>
          )}
          {error && (
            <div className={inlineError} role="alert">
              {error}
            </div>
          )}
          <div className={dialogFooter({ withContent: Boolean(children) })}>
            <button
              type="button"
              className={dialogBtn({ variant: 'cancel' })}
              onClick={handleClose}
              disabled={isLoading}
              data-autofocus={autoFocusCancel ? '' : undefined}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={dialogBtn({ variant: confirmVariant })}
              onClick={onConfirm}
              disabled={isLoading || confirmDisabled}
              aria-describedby={confirmDescribedBy}
            >
              {isLoading && <div className={spinner} aria-hidden="true" />}
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
