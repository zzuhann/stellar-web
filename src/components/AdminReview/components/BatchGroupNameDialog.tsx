'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import ModalOverlay from '@/components/ui/ModalOverlay';
import type { Artist } from '@/types';

interface BatchGroupNameDialogProps {
  artists: Artist[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (values: Record<string, string>) => void;
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
  position: 'sticky',
  top: 0,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '4',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  background: 'white',
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
  },
  '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
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

const dialogFooter = css({
  position: 'sticky',
  bottom: 0,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  background: 'white',
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
  '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
});

const confirmButton = css({
  minHeight: '44px',
  borderRadius: 'radius.xl',
  paddingX: '5',
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: 'white',
  background: 'color.primary',
  border: 'none',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { background: 'color.primaryHover' },
  '&:disabled': { cursor: 'not-allowed', background: 'color.text.disabled' },
});

export default function BatchGroupNameDialog({
  artists,
  busy,
  onClose,
  onConfirm,
}: BatchGroupNameDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  // 依畫面上實際顯示的值判斷 dirty（含未被使用者改動的預填團名），
  // 與 ReviewDialog（GroupNameModal）的 dirty 判斷方式一致：欄位非空即視為有未送出內容。
  const dirty = artists.some(
    (artist) => (values[artist.id] ?? artist.groupNames?.join('、') ?? '').trim() !== ''
  );
  const close = () => {
    if (dirty && !window.confirm('有未送出的內容，確定要離開嗎？')) return;
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [busy, dirty, onClose]);

  return (
    <ModalOverlay isOpen zIndex={1000} padding="16px" onClick={close}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-group-dialog-title"
        className={dialogSection}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <header className={dialogHeader}>
          <div>
            <h2 id="batch-group-dialog-title" className={dialogTitle}>
              批次設定團名
            </h2>
            <p className={dialogDesc}>可分別為每位藝人設定團名，留空也能通過。</p>
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
          {artists.map((artist) => (
            <label key={artist.id} className={fieldLabel}>
              {artist.stageNameZh || artist.stageName}
              <input
                value={values[artist.id] ?? artist.groupNames?.join('、') ?? ''}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [artist.id]: event.target.value }))
                }
                placeholder="多個團名請用頓號分隔"
                className={inputField}
              />
            </label>
          ))}
        </div>
        <footer className={dialogFooter}>
          <button type="button" onClick={close} disabled={busy} className={cancelButton}>
            取消
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(values)}
            className={confirmButton}
          >
            {busy ? '處理中…' : '確認通過'}
          </button>
        </footer>
      </section>
    </ModalOverlay>
  );
}
