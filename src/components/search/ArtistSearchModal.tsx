'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useArtistSearch } from '@/hooks/useArtistSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollLock } from '@/hooks/useScrollLock';
import ArtistCard from '../ArtistCard';
import { useAuth } from '@/lib/auth-context';
import EmptyState from '../EmptyState';
import CTAButton from '../CTAButton';
import Loading from '../Loading';
import { css, cva } from '@/styled-system/css';
import Link from 'next/link';

const modalOverlay = cva({
  base: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out',
    '@media (min-width: 768px)': {
      alignItems: 'center',
    },
  },
  variants: {
    isOpen: {
      true: {
        opacity: 1,
        visibility: 'visible',
      },
      false: {
        opacity: 0,
        visibility: 'hidden',
      },
    },
  },
});

const modalContent = cva({
  base: {
    background: 'color.background.primary',
    width: '100%',
    maxWidth: '600px',
    height: '80vh',
    borderRadius: '16px 16px 0 0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    '@media (min-width: 768px)': {
      borderRadius: '16px',
      margin: '0 16px',
      minHeight: '60vh',
      maxHeight: '80vh',
      transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    },
  },
  variants: {
    isOpen: {
      true: {
        transform: 'translateY(0)',
        '@media (min-width: 768px)': {
          transform: 'scale(1) translateY(0)',
        },
      },
      false: {
        transform: 'translateY(100%)',
        '@media (min-width: 768px)': {
          transform: 'scale(0.95) translateY(20px)',
        },
      },
    },
  },
});

const modalHeader = css({
  padding: '20px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  minWidth: 0,
  '@media (max-width: 480px)': {
    padding: '16px',
    gap: '12px',
  },
});

const closeButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  minWidth: '32px',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  flexShrink: 0,
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
});

const searchInputContainer = css({
  flex: 1,
  minWidth: 0,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '12px 16px',
  '& svg': {
    width: '20px',
    height: '20px',
    color: 'color.text.secondary',
    flexShrink: 0,
  },
  '@media (max-width: 480px)': {
    padding: '10px 12px',
    gap: '8px',
  },
});

const searchInput = css({
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: 'none',
  color: 'color.text.primary',
  fontSize: '16px',
  outline: 'none',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
  '@media (max-width: 480px)': {
    fontSize: '16px',
  },
});

const resultsContainer = css({
  flex: 1,
  overflowY: 'auto',
  padding: '0 20px 20px',
  minHeight: 0,
  position: 'relative',
});

const artistList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '16px',
  marginBottom: '16px',
});

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ArtistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export default function ArtistSearchModal({ isOpen, onClose, triggerRef }: ArtistSearchModalProps) {
  const router = useRouter();
  const { user, toggleAuthModal } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, 800);

  const { data: searchResults = [], isLoading: searchLoading } =
    useArtistSearch(debouncedSearchQuery);

  const showResults = debouncedSearchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  useScrollLock(isOpen);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => {
      triggerRef?.current?.focus();
    });
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // 開啟時 focus 到搜尋框
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  // Focus trap：Tab 時焦點不離開 modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const container = modalContentRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      className={modalOverlay({ isOpen })}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="搜尋偶像"
      aria-hidden={!isOpen}
    >
      <div
        ref={modalContentRef}
        className={modalContent({ isOpen })}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <div className={searchInputContainer}>
            <MagnifyingGlassIcon />
            <input
              ref={searchInputRef}
              className={searchInput}
              type="text"
              placeholder="藝名(英文)/本名(中文)/團名"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              aria-label="搜尋偶像"
            />
          </div>
          <button className={closeButton} onClick={handleClose} aria-label="關閉搜尋">
            <XMarkIcon aria-hidden="true" width={20} height={20} />
          </button>
        </div>

        <div className={resultsContainer}>
          {!showResults ? (
            <EmptyState icon="🔍" title="搜尋偶像" description="輸入偶像名稱來尋找生日應援" />
          ) : searchLoading ? (
            <Loading
              description="搜尋中..."
              style={{ background: 'transparent', border: 'none' }}
            />
          ) : hasResults ? (
            <>
              <div className={artistList}>
                {searchResults.map((artist) => {
                  return (
                    <Link
                      href={`/map/${artist.id}`}
                      key={artist.id}
                      onClick={handleClose}
                      aria-label={`前往 ${artist.stageName} 的生日應援地圖頁面`}
                    >
                      <ArtistCard artist={artist} />
                    </Link>
                  );
                })}
              </div>
              <CTAButton
                onClick={() => {
                  if (!user) {
                    toggleAuthModal('/submit-artist');
                  } else {
                    router.push('/submit-artist');
                  }
                }}
              >
                找不到偶像?
                <br />
                點擊前往新增偶像 ✨
              </CTAButton>
            </>
          ) : (
            <>
              <EmptyState
                icon="😔"
                title="找不到該偶像"
                description="試試其他關鍵字、檢查拼寫是否正確"
              />
              <CTAButton
                onClick={() => {
                  if (!user) {
                    toggleAuthModal('/submit-artist');
                  } else {
                    router.push('/submit-artist');
                  }
                }}
              >
                找不到偶像?
                <br />
                點擊前往新增偶像 ✨
              </CTAButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
