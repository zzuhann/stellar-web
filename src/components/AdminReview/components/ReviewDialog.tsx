'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

  const dirty = kind === 'reject' ? value.trim().length > 0 : groups.some((group) => group.trim());
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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-stellar-xl bg-surface shadow-stellar-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id="review-dialog-title" className="text-lg font-semibold text-content">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm leading-6 text-content-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="關閉"
            className="flex size-11 shrink-0 items-center justify-center rounded-stellar-xl text-content-disabled hover:bg-neutral-subtle focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XMarkIcon className="size-5" />
          </button>
        </header>
        <div className="space-y-4 px-6 py-5">
          {kind === 'reject' && (
            <label className="block text-sm font-medium text-content">
              拒絕原因
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="mt-2 min-h-32 w-full rounded-stellar-xl border border-line-strong px-3 py-2 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-subtle"
              />
              {!value.trim() && (
                <span className="mt-2 block text-sm text-danger">請輸入拒絕原因</span>
              )}
            </label>
          )}
          {kind === 'groups' &&
            groups.map((group, index) => (
              <label key={index} className="block text-sm font-medium text-content">
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
                  className="mt-2 h-11 w-full rounded-stellar-xl border border-line-strong px-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-subtle"
                />
              </label>
            ))}
          {kind === 'groups' && (
            <button
              type="button"
              onClick={() => setGroups((current) => [...current, ''])}
              className="min-h-11 text-sm font-medium text-brand"
            >
              ＋ 新增團名
            </button>
          )}
          {children}
        </div>
        {kind !== 'preview' && (
          <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">
            <button
              type="button"
              onClick={close}
              disabled={busy}
              className="min-h-11 rounded-stellar-xl px-4 text-sm font-medium text-content hover:bg-neutral-subtle"
            >
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
              className={`min-h-11 rounded-stellar-xl px-5 text-sm font-semibold text-surface disabled:cursor-not-allowed disabled:bg-content-disabled ${kind === 'reject' ? 'bg-danger hover:bg-danger-hover' : 'bg-brand hover:bg-brand-hover'}`}
            >
              {busy ? '處理中…' : kind === 'reject' ? '確認拒絕' : '確認通過'}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}
