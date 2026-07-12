'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Artist, UpdateArtistRequest } from '@/types';

interface ArtistEditDialogProps {
  artist: Artist;
  busy: boolean;
  onClose: () => void;
  onSave: (data: UpdateArtistRequest) => void;
}

export default function ArtistEditDialog({ artist, busy, onClose, onSave }: ArtistEditDialogProps) {
  const [form, setForm] = useState({
    stageName: artist.stageName,
    stageNameZh: artist.stageNameZh ?? '',
    groupNames: artist.groupNames?.join('、') ?? '',
    realName: artist.realName ?? '',
    birthday: artist.birthday ?? '',
    profileImage: artist.profileImage ?? '',
  });
  const initial = JSON.stringify({
    stageName: artist.stageName,
    stageNameZh: artist.stageNameZh ?? '',
    groupNames: artist.groupNames?.join('、') ?? '',
    realName: artist.realName ?? '',
    birthday: artist.birthday ?? '',
    profileImage: artist.profileImage ?? '',
  });
  const dirty = JSON.stringify(form) !== initial;
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

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <label className="block text-sm font-medium text-content">
      {label}
      <input
        type={type}
        value={form[key]}
        disabled={busy}
        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        className="mt-2 h-11 w-full rounded-stellar-xl border border-line-strong px-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-subtle disabled:bg-neutral-subtle"
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-edit-title"
        className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-stellar-xl bg-surface shadow-stellar-xl"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-6 py-5">
          <h2 id="artist-edit-title" className="text-lg font-semibold text-content">
            編輯藝人 — {artist.stageNameZh || artist.stageName}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="關閉"
            className="flex size-11 items-center justify-center rounded-stellar-xl text-content-disabled hover:bg-neutral-subtle"
          >
            <XMarkIcon className="size-5" />
          </button>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              ...form,
              stageName: form.stageName.trim(),
              stageNameZh: form.stageNameZh.trim(),
              realName: form.realName.trim(),
              profileImage: form.profileImage.trim(),
              groupNames: form.groupNames
                .split('、')
                .map((name) => name.trim())
                .filter(Boolean),
            });
          }}
        >
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            {field('stageName', '藝名（英文）')}
            {field('stageNameZh', '藝名（中文）')}
            {field('realName', '本名')}
            {field('birthday', '生日', 'date')}
            <div className="sm:col-span-2">{field('groupNames', '團名（多個請用頓號分隔）')}</div>
            <div className="sm:col-span-2">{field('profileImage', '照片網址', 'url')}</div>
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
              type="submit"
              disabled={busy || !dirty || !form.stageName.trim()}
              className="min-h-11 rounded-stellar-xl bg-brand px-5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:bg-content-disabled"
            >
              {busy ? '儲存中…' : '儲存'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
