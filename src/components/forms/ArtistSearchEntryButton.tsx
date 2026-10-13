'use client';

import { useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const wrapper = css({
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  paddingBottom: '8',
  marginBottom: '8',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const entryButton = css({
  width: '100%',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingY: '3',
  paddingX: '4',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  color: 'color.text.secondary',
  textStyle: 'body',
  textAlign: 'left',
  cursor: 'pointer',
  '& svg': {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const LABEL = '投稿前，先確認你想新增的藝人、團體是否已經存在';

// Looks like a search field but is a button: it only opens the global ArtistSearchModal.
export default function ArtistSearchEntryButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = useSearchModalStore((state) => state.open);

  return (
    <div className={wrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={entryButton}
        aria-haspopup="dialog"
        aria-label={LABEL}
        onClick={() => open('submit_artist_page', buttonRef)}
      >
        <MagnifyingGlassIcon aria-hidden="true" />
        <span>{LABEL}</span>
      </button>
    </div>
  );
}
