'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { useArtistSearch } from '@/hooks/useArtistSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollLock } from '@/hooks/useScrollLock';
import { Artist } from '@/types';
import ArtistCard from '../ArtistCard';
import { useAuth } from '@/lib/auth-context';

interface ArtistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Styled Components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease-out,
    visibility 0.3s ease-out;

  @media (min-width: 768px) {
    align-items: center;
  }
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: var(--color-bg-primary);
  width: 100%;
  max-width: 600px;
  height: 80vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: ${(props) => (props.$isOpen ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);

  @media (min-width: 768px) {
    border-radius: 16px;
    margin: 0 16px;
    min-height: 60vh;
    max-height: 80vh;
    transform: ${(props) =>
      props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)'};
    transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0; /* 允許 flex item 縮小 */

  @media (max-width: 480px) {
    padding: 16px;
    gap: 12px;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px; /* 防止按鈕被壓縮 */
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0; /* 防止按鈕被壓縮 */

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
  min-width: 0; /* 允許 flex item 縮小 */
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
    flex-shrink: 0; /* 防止 icon 被壓縮 */
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 8px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0; /* 允許 input 縮小 */
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  @media (max-width: 480px) {
    font-size: 16px; /* 保持 16px 避免 iOS Safari 縮放 */
  }
`;

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  min-height: 0; /* 讓 flex item 可以縮小 */
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

const CTAButton = styled.button`
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 16px;
`;

export default function ArtistSearchModal({ isOpen, onClose }: ArtistSearchModalProps) {
  const router = useRouter();
  const { user, toggleAuthModal } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, 800);

  // 使用 React Query 進行搜尋
  const { data: searchResults = [], isLoading: searchLoading } =
    useArtistSearch(debouncedSearchQuery);

  // 使用 scroll lock hook
  useScrollLock(isOpen);

  // 處理藝人點擊
  const handleArtistClick = (artist: Artist) => {
    onClose();
    router.push(`/map/${artist.id}`);
  };

  // 關閉 modal 時清除輸入
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  const showResults = debouncedSearchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <SearchInputContainer>
            <MagnifyingGlassIcon />
            <SearchInput
              type="text"
              placeholder="藝名(英文)/本名(中文)/團名"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </SearchInputContainer>
          <CloseButton onClick={onClose}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

        <ResultsContainer>
          {!showResults ? (
            <EmptyState>
              <div className="icon">🔍</div>
              <h3>搜尋偶像</h3>
              <p>輸入偶像名稱來尋找生日應援</p>
            </EmptyState>
          ) : searchLoading ? (
            <LoadingState>
              <div className="spinner" />
              <p>搜尋中...</p>
            </LoadingState>
          ) : hasResults ? (
            <>
              <ArtistList>
                {searchResults.map((artist) => {
                  return (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      handleArtistClick={handleArtistClick}
                    />
                  );
                })}
              </ArtistList>
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
              <EmptyState>
                <div className="icon">😔</div>
                <h3>找不到該偶像</h3>
                <p>試試其他關鍵字、檢查拼寫是否正確</p>
              </EmptyState>
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
        </ResultsContainer>
      </ModalContent>
    </ModalOverlay>
  );
}
