'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { useSearchStore } from '@/store';
import { useDebounce } from '@/hooks/useDebounce';
import { Artist } from '@/types';

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

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
  }
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

const ArtistItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: ${(props) =>
    props.isSelected ? 'var(--color-primary)' : 'var(--color-bg-secondary)'};
  border: 1px solid
    ${(props) => (props.isSelected ? 'var(--color-primary)' : 'var(--color-border-light)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.isSelected ? 'var(--color-primary)' : 'var(--color-bg-tertiary)'};
    border-color: ${(props) =>
      props.isSelected ? 'var(--color-primary)' : 'var(--color-border-medium)'};
  }
`;

const ArtistInfo = styled.div`
  flex: 1;
`;

const ArtistName = styled.div<{ isSelected?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.isSelected ? 'white' : 'var(--color-text-primary)')};
  margin-bottom: 4px;
`;

const ArtistRealName = styled.div<{ isSelected?: boolean }>`
  font-size: 14px;
  color: ${(props) =>
    props.isSelected ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-text-secondary)'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
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

export default function ArtistSelectionModal({
  isOpen,
  onClose,
  onArtistSelect,
  selectedArtistIds = [],
}: ArtistSelectionModalProps) {
  const { searchResults, searchLoading, searchQuery, searchArtists, clearSearch, setSearchQuery } =
    useSearchStore();

  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, 500);

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
    }
  }, [isOpen, clearSearch]);

  const showResults = searchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <XMarkIcon />
          </CloseButton>

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
          {!showResults ? (
            <EmptyState>
              <div className="icon">🎤</div>
              <h3>選擇應援偶像</h3>
              <p>輸入偶像名稱來搜尋並選擇</p>
            </EmptyState>
          ) : searchLoading ? (
            <LoadingState>
              <div className="spinner" />
              <p>搜尋中...</p>
            </LoadingState>
          ) : hasResults ? (
            <ArtistList>
              {searchResults.map((artist) => (
                <ArtistItem
                  key={artist.id}
                  isSelected={selectedArtistIds.includes(artist.id)}
                  onClick={() => handleArtistSelect(artist)}
                >
                  <ArtistInfo>
                    <ArtistName isSelected={selectedArtistIds.includes(artist.id)}>
                      {artist.stageName}
                    </ArtistName>
                    {artist.realName && (
                      <ArtistRealName isSelected={selectedArtistIds.includes(artist.id)}>
                        {artist.realName}
                      </ArtistRealName>
                    )}
                  </ArtistInfo>
                </ArtistItem>
              ))}
            </ArtistList>
          ) : (
            <EmptyState>
              <div className="icon">😔</div>
              <h3>找不到該偶像</h3>
              <p>試試其他關鍵字、檢查拼寫是否正確</p>
            </EmptyState>
          )}
        </ResultsContainer>
      </ModalContent>
    </ModalOverlay>
  );
}
