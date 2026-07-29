'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import ModalOverlay from '@/components/ui/ModalOverlay';

interface ReviewDialogProps {
  open: boolean;
  title: string;
  description?: string;
  kind: 'reject' | 'groups' | 'preview';
  initialValues?: string[];
  busy?: boolean;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: (value: string | string[]) => void;
}

const dialogSection = css({
  width: '100%',
  maxWidth: '512px',
  maxHeight: '90dvh',
  overflowY: 'auto',
  background: 'white',
  borderRadius: 'radius.xl',
  boxShadow: 'shadow.xl',
});

const dialogHeader = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '4',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  paddingX: '6',
  paddingY: '5',
});

const dialogTitle = css({
  fontSize: 'lg',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const dialogDesc = css({
  marginTop: '1',
  fontSize: 'sm',
  lineHeight: '1.5rem',
  color: 'color.text.secondary',
});

const closeButton = css({
  display: 'flex',
  flexShrink: 0,
  width: '44px',
  height: '44px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'radius.xl',
  color: 'color.text.disabled',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  '&:hover': { background: 'gray.100' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
    background: 'gray.100',
  },
});

const iconSize = css({ width: '20px', height: '20px' });

const bodyContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  paddingX: '6',
  paddingY: '5',
});

const fieldLabel = css({
  display: 'block',
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'color.text.primary',
});

const textareaField = css({
  marginTop: '2',
  minHeight: '128px',
  width: '100%',
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'color.border.medium',
  paddingX: '3',
  paddingY: '2',
  fontSize: 'base',
  color: 'color.text.primary',
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
});

const errorText = css({
  marginTop: '2',
  display: 'block',
  fontSize: 'sm',
  color: 'color.status.error',
});

const inputField = css({
  marginTop: '2',
  height: '44px',
  width: '100%',
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'color.border.medium',
  paddingX: '3',
  color: 'color.text.primary',
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
});

const addGroupButton = css({
  minHeight: '44px',
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'color.primary',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const footerRow = css({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingX: '6',
  paddingY: '4',
});

const cancelButton = css({
  minHeight: '44px',
  borderRadius: 'radius.xl',
  paddingX: '4',
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'color.text.primary',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  '&:hover': { background: 'gray.100' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
  '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
});

const confirmButton = cva({
  base: {
    minHeight: '44px',
    borderRadius: 'radius.xl',
    paddingX: '5',
    fontSize: 'sm',
    fontWeight: 'semibold',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '2px',
    },
    '&:disabled': { cursor: 'not-allowed', background: 'color.text.disabled' },
  },
  variants: {
    kind: {
      reject: {
        background: 'color.status.error',
        '&:hover:not(:disabled)': { background: 'red.700' },
      },
      groups: {
        background: 'color.primary',
        '&:hover:not(:disabled)': { background: 'color.primaryHover' },
      },
    },
  },
});

export default function ReviewDialog({
  open,
  title,
  description,
  kind,
  initialValues = [],
  busy = false,
  children,
  onClose,
  onConfirm,
}: ReviewDialogProps) {
  const [value, setValue] = useState('');
  const [groups, setGroups] = useState<string[]>(initialValues.length ? initialValues : ['']);

  // dirty 只看「目前值」是否偏離初始預填值（trim 後、忽略新增的空白欄位），
  // 團名欄位預填但未被使用者改動時不算 dirty，與 ArtistEditDialog 的 dirty 判斷方式一致。
  const meaningfulGroups = (list: string[]) => list.map((group) => group.trim()).filter(Boolean);
  const dirty =
    kind === 'reject'
      ? value.trim().length > 0
      : JSON.stringify(meaningfulGroups(groups)) !==
        JSON.stringify(meaningfulGroups(initialValues));
  const close = () => {
    if (dirty && !window.confirm('有未送出的內容，確定要離開嗎？')) return;
    setValue('');
    setGroups(initialValues.length ? initialValues : ['']);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || busy) return;
      if (dirty && !window.confirm('有未送出的內容，確定要離開嗎？')) return;
      setValue('');
      setGroups(initialValues.length ? initialValues : ['']);
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [busy, dirty, initialValues, onClose, open]);

  if (!open) return null;

  return (
    <ModalOverlay isOpen zIndex={1000} padding="16px" onClick={close}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        className={dialogSection}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <header className={dialogHeader}>
          <div>
            <h2 id="review-dialog-title" className={dialogTitle}>
              {title}
            </h2>
            {description && <p className={dialogDesc}>{description}</p>}
          </div>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="關閉"
            className={closeButton}
          >
            <XMarkIcon className={iconSize} />
          </button>
        </header>
        <div className={bodyContainer}>
          {kind === 'reject' && (
            <label className={fieldLabel}>
              拒絕原因
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className={textareaField}
              />
              {!value.trim() && <span className={errorText}>請輸入拒絕原因</span>}
            </label>
          )}
          {kind === 'groups' &&
            groups.map((group, index) => (
              <label key={index} className={fieldLabel}>
                團名 {index + 1}
                <input
                  value={group}
                  onChange={(event) =>
                    setGroups((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      )
                    )
                  }
                  className={inputField}
                />
              </label>
            ))}
          {kind === 'groups' && (
            <button
              type="button"
              onClick={() => setGroups((current) => [...current, ''])}
              className={addGroupButton}
            >
              ＋ 新增團名
            </button>
          )}
          {children}
        </div>
        {kind !== 'preview' && (
          <footer className={footerRow}>
            <button type="button" onClick={close} disabled={busy} className={cancelButton}>
              取消
            </button>
            <button
              type="button"
              disabled={busy || (kind === 'reject' && !value.trim())}
              onClick={() =>
                onConfirm?.(
                  kind === 'reject'
                    ? value.trim()
                    : groups.map((group) => group.trim()).filter(Boolean)
                )
              }
              className={confirmButton({ kind: kind === 'reject' ? 'reject' : 'groups' })}
            >
              {busy ? '處理中…' : kind === 'reject' ? '確認拒絕' : '確認通過'}
            </button>
          </footer>
        )}
      </section>
    </ModalOverlay>
  );
}
