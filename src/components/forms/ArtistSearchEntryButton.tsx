'use client';

import { useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const entryButton = css({
  width: '100%',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingY: '3',
  paddingX: '4',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  color: 'color.text.disabled',
  textStyle: 'body',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '& svg': {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
});

interface ArtistSearchEntryButtonProps {
  labelId: string;
}

// Looks like a search field but is a button: it only opens the global ArtistSearchModal.
export default function ArtistSearchEntryButton({ labelId }: ArtistSearchEntryButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = useSearchModalStore((state) => state.open);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={entryButton}
      aria-haspopup="dialog"
      aria-labelledby={labelId}
      onClick={() => open('submit_artist_page', buttonRef)}
    >
      <MagnifyingGlassIcon aria-hidden="true" />
      <span>搜尋藝人、團體</span>
    </button>
  );
}
