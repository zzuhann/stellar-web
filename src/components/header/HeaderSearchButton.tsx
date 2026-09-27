'use client';

import { useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const headerSearchButton = css({
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'color.text.primary',
  cursor: 'pointer',
  padding: '2',
  // Explicit min size (not just the box) to guarantee the 44x44 touch target regardless of icon/padding sizing drift.
  minWidth: '44px',
  minHeight: '44px',
  borderRadius: 'radius.sm',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
  '@media (max-width: 768px)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Mobile-only header entry point for ArtistSearchModal (desktop keeps DesktopNav text-link only nav).
export default function HeaderSearchButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = useSearchModalStore((state) => state.open);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={headerSearchButton}
      onClick={() => open('header', buttonRef)}
      aria-label="搜尋藝人"
    >
      <MagnifyingGlassIcon width={20} height={20} aria-hidden="true" />
    </button>
  );
}
