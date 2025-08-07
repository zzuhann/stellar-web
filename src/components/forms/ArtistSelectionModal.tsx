'use client';

import { useState, useEffect } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { useSearchStore } from '@/store';
import { useArtistStore } from '@/store';
import { useDebounce } from '@/hooks/useDebounce';
import { Artist } from '@/types';
import ArtistCard from '../ArtistCard';

interface ArtistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArtistSelect: (artist: Artist) => void;
  selectedArtistIds?: string[];
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease-out,
    visibility 0.3s ease-out;

  @media (min-width: 768px) {
    align-items: center;
  }
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
  background: var(--color-bg-primary);
  width: 100%;
  max-width: 600px;
  height: 85vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);

  @media (min-width: 768px) {
    border-radius: 16px;
    margin: 0 16px;
    min-height: 60vh;
    max-height: 80vh;
    transform: ${(props) =>
      props.isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)'};
    transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchInputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 12px 16px;

  svg {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  @media (max-width: 400px) {
    font-size: 14px;
  }
`;

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  min-height: 0;
  position: relative;
`;

const ArtistList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: var(--color-text-secondary);

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-border-light);
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 獲取當月的開始和結束日期
const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // 下個月的第0天 = 這個月的最後一天

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

export default function ArtistSelectionModal({
  isOpen,
  onClose,
  onArtistSelect,
}: ArtistSelectionModalProps) {
  const { searchResults, searchLoading, searchQuery, searchArtists, clearSearch, setSearchQuery } =
    useSearchStore();
  const {
    artists: monthlyBirthdayArtists,
    loading: monthlyLoading,
    fetchArtists,
  } = useArtistStore();

  const [inputValue, setInputValue] = useState('');
  const [hasLoadedMonthlyArtists, setHasLoadedMonthlyArtists] = useState(false);
  const debouncedSearchQuery = useDebounce(inputValue, 500);

  // 載入當月壽星（模態框打開時）
  useEffect(() => {
    if (isOpen && !hasLoadedMonthlyArtists) {
      const { startDate, endDate } = getCurrentMonthRange();
      fetchArtists({
        status: 'approved',
        birthdayStartDate: startDate,
        birthdayEndDate: endDate,
        includeStats: true,
        sortBy: 'coffeeEventCount',
        sortOrder: 'desc',
      });
      setHasLoadedMonthlyArtists(true);
    }
  }, [isOpen, hasLoadedMonthlyArtists, fetchArtists]);

  // 使用 debounced 值進行搜尋
  useEffect(() => {
    if (isOpen && debouncedSearchQuery.trim()) {
      setSearchQuery(debouncedSearchQuery);
      searchArtists(debouncedSearchQuery);
    } else if (isOpen && !debouncedSearchQuery.trim()) {
      clearSearch();
    }
  }, [isOpen, debouncedSearchQuery, searchArtists, clearSearch, setSearchQuery]);

  // 處理藝人選擇
  const handleArtistSelect = (artist: Artist) => {
    onArtistSelect(artist);
    onClose();
  };

  // 關閉 modal 時清除所有狀態
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      clearSearch();
      setHasLoadedMonthlyArtists(false);
    }
  }, [isOpen, clearSearch]);

  const isSearching = searchQuery.trim().length > 0;
  const hasSearchResults = searchResults.length > 0;
  const hasMonthlyArtists = monthlyBirthdayArtists.length > 0;

  // 計算當前月份名稱
  const currentMonth = new Date().toLocaleDateString('zh-TW', { month: 'long' });

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <SearchInputContainer>
            <UserIcon />
            <SearchInput
              type="text"
              placeholder="搜尋偶像名稱..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </SearchInputContainer>
        </ModalHeader>

        <ResultsContainer>
          {isSearching ? (
            // 搜尋模式：顯示搜尋結果
            searchLoading ? (
              <LoadingState>
                <div className="spinner" />
                <p>搜尋中...</p>
              </LoadingState>
            ) : hasSearchResults ? (
              <ArtistList>
                {searchResults.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    handleArtistClick={handleArtistSelect}
                  />
                ))}
              </ArtistList>
            ) : (
              <EmptyState>
                <div className="icon">😔</div>
                <h3>找不到該偶像</h3>
                <p>試試其他關鍵字、檢查拼寫是否正確</p>
              </EmptyState>
            )
          ) : // 預設模式：顯示當月壽星
          monthlyLoading ? (
            <LoadingState>
              <div className="spinner" />
              <p>載入{currentMonth}壽星中...</p>
            </LoadingState>
          ) : hasMonthlyArtists ? (
            <ArtistList>
              <EmptyState style={{ paddingBottom: '20px' }}>
                <h3>本月壽星 ✨</h3>
                <p>選擇要應援的偶像，或在上方搜尋其他偶像</p>
              </EmptyState>
              {monthlyBirthdayArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  handleArtistClick={handleArtistSelect}
                />
              ))}
            </ArtistList>
          ) : (
            <EmptyState>
              <p>在上方輸入偶像名稱來搜尋並選擇 ✨</p>
            </EmptyState>
          )}
        </ResultsContainer>
      </ModalContent>
    </ModalOverlay>
  );
}
