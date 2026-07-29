'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import ModalOverlay from '@/components/ui/ModalOverlay';
import type { Artist, UpdateArtistRequest } from '@/types';

interface ArtistEditDialogProps {
  artist: Artist;
  busy: boolean;
  onClose: () => void;
  onSave: (data: UpdateArtistRequest) => void;
}

const dialogSection = css({
  width: '100%',
  maxWidth: '576px',
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
  alignItems: 'center',
  justifyContent: 'space-between',
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

const closeButton = css({
  display: 'flex',
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

const formGrid = css({
  display: 'grid',
  gap: '4',
  paddingX: '6',
  paddingY: '5',
  sm: { gridTemplateColumns: 'repeat(2, 1fr)' },
});

const spanTwo = css({ sm: { gridColumn: 'span 2' } });

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
  fontSize: 'base',
  color: 'color.text.primary',
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&:disabled': { background: 'gray.100' },
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

const saveButton = css({
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
    <label className={fieldLabel}>
      {label}
      <input
        type={type}
        value={form[key]}
        disabled={busy}
        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        className={inputField}
      />
    </label>
  );

  return (
    <ModalOverlay isOpen zIndex={1000} padding="16px" onClick={close}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-edit-title"
        className={dialogSection}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <header className={dialogHeader}>
          <h2 id="artist-edit-title" className={dialogTitle}>
            編輯藝人 — {artist.stageNameZh || artist.stageName}
          </h2>
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
          <div className={formGrid}>
            {field('stageName', '藝名（英文）')}
            {field('stageNameZh', '藝名（中文）')}
            {field('realName', '本名')}
            {field('birthday', '生日', 'date')}
            <div className={spanTwo}>{field('groupNames', '團名（多個請用頓號分隔）')}</div>
            <div className={spanTwo}>{field('profileImage', '照片網址', 'url')}</div>
          </div>
          <footer className={dialogFooter}>
            <button type="button" onClick={close} disabled={busy} className={cancelButton}>
              取消
            </button>
            <button
              type="submit"
              disabled={busy || !dirty || !form.stageName.trim()}
              className={saveButton}
            >
              {busy ? '儲存中…' : '儲存'}
            </button>
          </footer>
        </form>
      </section>
    </ModalOverlay>
  );
}
