'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useArtistSearch } from '@/hooks/useArtistSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
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
    background: 'alpha.black.50',
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
  padding: '5',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  minWidth: 0,
  '@media (max-width: 480px)': {
    padding: '4',
    gap: '3',
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
  gap: '3',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  paddingY: '3',
  paddingX: '4',
  '& svg': {
    width: '20px',
    height: '20px',
    color: 'color.text.secondary',
    flexShrink: 0,
  },
  '@media (max-width: 480px)': {
    gap: '2',
  },
});

const searchInput = css({
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: 'none',
  color: 'color.text.primary',
  textStyle: 'body',
  outline: 'none',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
});

const resultsContainer = css({
  flex: 1,
  overflowY: 'auto',
  paddingX: '5',
  paddingBottom: '5',
  paddingTop: '0',
  minHeight: 0,
  position: 'relative',
});

const artistList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  marginTop: '4',
  marginBottom: '4',
});

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

  // Focus trap with custom return focus element
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen, {
    returnFocusTo: triggerRef,
    disableAutoFocus: true, // We'll manually focus the search input
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      className={modalOverlay({ isOpen })}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="搜尋偶像"
      aria-hidden={!isOpen}
    >
      <div
        ref={focusTrapRef}
        className={modalContent({ isOpen })}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <div className={searchInputContainer}>
            <MagnifyingGlassIcon aria-hidden="true" />
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
          <button className={closeButton} onClick={onClose} aria-label="關閉搜尋">
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
                      onClick={onClose}
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
