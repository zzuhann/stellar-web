'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Artist } from '@/types';

interface BatchGroupNameDialogProps {
  artists: Artist[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (values: Record<string, string>) => void;
}

export default function BatchGroupNameDialog({
  artists,
  busy,
  onClose,
  onConfirm,
}: BatchGroupNameDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const dirty = Object.values(values).some((value) => value.trim());
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
  });

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-group-dialog-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-stellar-xl bg-surface shadow-stellar-xl"
      >
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
          <div>
            <h2 id="batch-group-dialog-title" className="text-lg font-semibold text-content">
              批次設定團名
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              可分別為每位藝人設定團名，留空也能通過。
            </p>
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
          {artists.map((artist) => (
            <label key={artist.id} className="block text-sm font-medium text-content">
              {artist.stageNameZh || artist.stageName}
              <input
                value={values[artist.id] ?? artist.groupNames?.join('、') ?? ''}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [artist.id]: event.target.value }))
                }
                placeholder="多個團名請用頓號分隔"
                className="mt-2 h-11 w-full rounded-stellar-xl border border-line-strong px-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-subtle"
              />
            </label>
          ))}
        </div>
        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-surface px-6 py-4">
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
            disabled={busy}
            onClick={() => onConfirm(values)}
            className="min-h-11 rounded-stellar-xl bg-brand px-5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:bg-content-disabled"
          >
            {busy ? '處理中…' : '確認通過'}
          </button>
        </footer>
      </section>
    </div>
  );
}
