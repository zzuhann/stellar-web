'use client';

import { useState, useEffect } from 'react';
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { useArtistSearch, useMonthlyBirthdayArtists } from '@/hooks/useArtistSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Artist } from '@/types';
import ArtistCard from '../ArtistCard';
import { useRouter } from 'next/navigation';
import { getCurrentMonthRange } from '@/utils/weekHelpers';
import Loading from '../Loading';
import EmptyState from '../EmptyState';

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

const ctaButton = css({
  padding: '12px 24px',
  borderRadius: 'radius.lg',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  position: 'relative',
  marginTop: '24px',
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
  '& svg': {
    width: '20px',
    height: '20px',
  },
});

const artistCardButton = css({
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'left',
  display: 'block',
  width: '100%',
  cursor: 'pointer',
});

interface ArtistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArtistSelect: (artist: Artist) => void;
  selectedArtistIds?: string[];
}

export default function ArtistSelectionModal({
  isOpen,
  onClose,
  onArtistSelect,
  selectedArtistIds = [],
}: ArtistSelectionModalProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, 800);

  const { data: searchResults = [], isLoading: searchLoading } =
    useArtistSearch(debouncedSearchQuery);

  const isSearching = debouncedSearchQuery.trim().length > 0;

  const { startDate, endDate, today } = getCurrentMonthRange();
  const { data: monthlyBirthdayArtists = [], isLoading: monthlyLoading } =
    useMonthlyBirthdayArtists({
      startDate,
      endDate,
      today,
      enabled: isOpen,
    });

  // 過濾掉已選擇的藝人
  const filteredSearchResults = searchResults.filter(
    (artist) => !selectedArtistIds.includes(artist.id)
  );
  const filteredMonthlyArtists = monthlyBirthdayArtists.filter(
    (artist) => !selectedArtistIds.includes(artist.id)
  );

  const hasSearchResults = filteredSearchResults.length > 0;
  const hasMonthlyArtists = filteredMonthlyArtists.length > 0;

  // 計算當前月份名稱
  const currentMonth = new Date().toLocaleDateString('zh-TW', { month: 'long' });

  useScrollLock(isOpen);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  const handleArtistSelect = (artist: Artist) => {
    onArtistSelect(artist);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  return (
    <div className={modalOverlay({ isOpen })} onClick={onClose}>
      <div
        ref={focusTrapRef}
        className={modalContent({ isOpen })}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="選擇偶像"
      >
        <div className={modalHeader}>
          <div className={searchInputContainer}>
            <UserIcon aria-hidden="true" />
            <input
              aria-label="搜尋偶像的藝名、本名或團名"
              className={searchInput}
              type="text"
              placeholder="藝名(英文)/本名(中文)/團名"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
          <button className={closeButton} onClick={onClose} aria-label="關閉選擇偶像">
            <XMarkIcon aria-hidden="true" />
          </button>
        </div>

        <div className={resultsContainer}>
          {isSearching ? (
            // 搜尋模式：顯示搜尋結果
            searchLoading ? (
              <Loading
                description="搜尋中..."
                style={{ background: 'transparent', border: 'none', width: '100%' }}
              />
            ) : hasSearchResults ? (
              <div className={artistList}>
                {filteredSearchResults.map((artist) => (
                  <button
                    className={artistCardButton}
                    key={artist.id}
                    onClick={() => handleArtistSelect(artist)}
                    type="button"
                    aria-label={`選擇 ${artist.stageName} 作為要應援的偶像`}
                  >
                    <ArtistCard artist={artist} />
                  </button>
                ))}
                <EmptyState
                  title="找不到偶像嗎？"
                  description={
                    <>
                      <p>試試其他關鍵字、檢查拼寫是否正確</p>
                      <p>也可能是系統中還沒有你偶像的個人檔案 ⬇️</p>
                    </>
                  }
                  cta={
                    <button className={ctaButton} onClick={() => router.push('/submit-artist')}>
                      點擊前往新增偶像 ✨<p>點擊後，將會跳轉至新增偶像頁面</p>
                    </button>
                  }
                />
              </div>
            ) : (
              <EmptyState
                icon="😔"
                title="找不到該偶像"
                description={
                  <>
                    <p>試試其他關鍵字、檢查拼寫是否正確</p>
                    <p>也可能是系統中還沒有你偶像的個人檔案 ⬇️</p>
                  </>
                }
                cta={
                  <button className={ctaButton} onClick={() => router.push('/submit-artist')}>
                    點擊前往新增偶像 ✨<p>點擊後，將會跳轉至新增偶像頁面</p>
                  </button>
                }
              />
            )
          ) : // 預設模式：顯示當月壽星
          monthlyLoading ? (
            <Loading
              description={`載入${currentMonth}壽星中...`}
              style={{ background: 'transparent', border: 'none', width: '100%' }}
            />
          ) : hasMonthlyArtists ? (
            <div className={artistList}>
              <EmptyState
                title="本月即將到來的壽星 ✨"
                description="選擇要應援的偶像，或在上方搜尋其他偶像"
                style={{ paddingBottom: '20px' }}
              />
              {filteredMonthlyArtists.map((artist) => (
                <button
                  className={artistCardButton}
                  key={artist.id}
                  onClick={() => handleArtistSelect(artist)}
                  type="button"
                  aria-label={`選擇 ${artist.stageName} 作為要應援的偶像`}
                >
                  <ArtistCard artist={artist} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState description="在上方輸入偶像名稱來搜尋並選擇 ✨" />
          )}
        </div>
      </div>
    </div>
  );
}
