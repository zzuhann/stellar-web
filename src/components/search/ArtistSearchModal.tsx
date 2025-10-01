'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useArtistSearch } from '@/hooks/useArtistSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollLock } from '@/hooks/useScrollLock';
import { Artist } from '@/types';
import ArtistCard from '../ArtistCard';
import { useAuth } from '@/lib/auth-context';
import ModalOverlayWithTransition from '../ui/ModalOverlayWithTransition';
import EmptyState from '../HomePage/components/EmptyState';
import CTAButton from '../CTAButton';
import Loading from '../Loading';
import { css, cva } from '@/styled-system/css';

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
  borderColor: 'color.border.light',
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
});

interface ArtistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtistSearchModal({ isOpen, onClose }: ArtistSearchModalProps) {
  const router = useRouter();
  const { user, toggleAuthModal } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, 800);

  const { data: searchResults = [], isLoading: searchLoading } =
    useArtistSearch(debouncedSearchQuery);

  const showResults = debouncedSearchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  useScrollLock(isOpen);

  const handleArtistClick = (artist: Artist) => {
    onClose();
    router.push(`/map/${artist.id}`);
  };

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  return (
    <ModalOverlayWithTransition isOpen={isOpen} onClick={onClose}>
      <div className={modalContent({ isOpen })} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeader}>
          <div className={searchInputContainer}>
            <MagnifyingGlassIcon />
            <input
              className={searchInput}
              type="text"
              placeholder="藝名(英文)/本名(中文)/團名"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
          <button className={closeButton} onClick={onClose}>
            <XMarkIcon width={20} height={20} />
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
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      handleArtistClick={handleArtistClick}
                    />
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
                style={{
                  position: 'relative',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '16px',
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
                style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
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
    </ModalOverlayWithTransition>
  );
}
