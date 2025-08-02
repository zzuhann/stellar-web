'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { useArtistStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { Artist } from '@/types';
import Header from './Header';
import AuthModal from '@/components/auth/AuthModal';
import ArtistSearchModal from '@/components/search/ArtistSearchModal';
import ArtistCard from '../ArtistCard';
import { getDaysUntilBirthday } from '@/utils';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  padding-top: 100px;
  max-width: 600px;
  margin: 0 auto;
  padding: 100px 16px 40px;

  @media (min-width: 768px) {
    padding: 100px 24px 60px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PageTitle = styled.div`
  text-align: center;
  margin-bottom: 8px;

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;

    @media (min-width: 768px) {
      font-size: 24px;
      margin: 0 0 12px 0;
    }
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;

    @media (min-width: 768px) {
      font-size: 16px;
    }
  }
`;

const WeekNavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
`;

const WeekNavigationButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-md);
  color: ${(props) =>
    props.disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)'};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const WeekInfo = styled.div`
  text-align: center;
  flex: 1;
  margin: 0 16px;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 4px 0;
  }

  .date-range {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 8px 16px;

  svg {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
  }
`;

const SearchInput = styled.div`
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 14px;
  outline: none;
  cursor: pointer;
  padding: 0;
  min-height: 20px;
  display: flex;
  align-items: center;

  &::placeholder {
    color: var(--color-text-secondary);
    font-size: 14px;
  }
`;

const ArtistList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const CTAButton = styled.button`
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  max-width: 50%;
  margin: 32px auto 0;
`;

const LoadingContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
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

// 工具函數
const getWeekStart = (date: Date): Date => {
  const d = new Date(date.getTime()); // 確保不修改原始 date
  const day = d.getDay();
  const diff = d.getDate() - day; // 星期日為 0
  d.setDate(diff);
  // 設定為當天開始（00:00:00）
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekEnd = (weekStart: Date): Date => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
};

const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function ArtistHomePage() {
  const router = useRouter();
  const { user, authModalOpen, toggleAuthModal } = useAuth();
  const { artists, loading, fetchArtists } = useArtistStore();

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // 載入當週壽星
  useEffect(() => {
    const fetchWeekBirthdayArtists = async () => {
      const weekStart = getWeekStart(currentWeekStart);
      const weekEnd = getWeekEnd(weekStart);

      const startDate = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      const endDate = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

      try {
        await fetchArtists({
          status: 'approved',
          birthdayStartDate: startDate,
          birthdayEndDate: endDate,
          includeStats: true,
          sortBy: 'coffeeEventCount',
          sortOrder: 'desc',
        });
      } catch {
        // 如果 API 失敗，會使用 Zustand store 的錯誤處理
      }
    };

    fetchWeekBirthdayArtists();
  }, [currentWeekStart, fetchArtists]);

  // 計算當前週的結束日期
  const currentWeekEnd = useMemo(() => getWeekEnd(currentWeekStart), [currentWeekStart]);

  // 後端已經按生咖數量排序，前端只需要把當日壽星提到最前面
  const weekBirthdayArtists = useMemo(() => {
    const todayArtists: Artist[] = [];
    const otherArtists: Artist[] = [];

    artists.forEach((artist) => {
      if (artist.birthday && getDaysUntilBirthday(artist.birthday) === 0) {
        todayArtists.push(artist);
      } else {
        otherArtists.push(artist);
      }
    });

    // 當日壽星在前，其他按 API 原本的順序（已按生咖數量排序）
    return [...todayArtists, ...otherArtists];
  }, [artists]);

  // 直接使用當週壽星，搜尋功能在獨立的 modal 中處理

  // 週導航
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);

    // 不能選擇比當前週更早的週（允許回到當前週）
    const today = new Date();
    const thisWeekStart = getWeekStart(today);

    if (newWeekStart.getTime() >= thisWeekStart.getTime()) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // 判斷是否可以點擊上一週（只要不是回到本週之前就可以）
  const canGoToPreviousWeek = useMemo(() => {
    const today = new Date();
    const thisWeekStart = getWeekStart(today);

    // 計算如果點擊上一週，會回到哪一週
    const wouldGoToWeek = new Date(currentWeekStart.getTime());
    wouldGoToWeek.setDate(wouldGoToWeek.getDate() - 7);
    wouldGoToWeek.setHours(0, 0, 0, 0);

    // 允許回到當前週或之後的週，不允許回到當前週之前
    return wouldGoToWeek.getTime() >= thisWeekStart.getTime();
  }, [currentWeekStart]);

  // 判斷是否為當前週（用於顯示文字）
  const isCurrentWeek = useMemo(() => {
    const thisWeekStart = getWeekStart(new Date());
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  }, [currentWeekStart]);

  const handleArtistClick = (artist: Artist) => {
    // 導航到地圖頁面，並傳遞選中的藝人 ID
    router.push(`/map?artistId=${artist.id}`);
  };

  return (
    <PageContainer>
      <Header />

      <MainContainer>
        <ContentWrapper>
          {/* 頁面標題 */}
          <PageTitle>
            <p>篩選偶像以尋找附近的生咖活動</p>
          </PageTitle>

          {/* 週導航 */}
          <WeekNavigationContainer>
            <WeekNavigationButton onClick={goToPreviousWeek} disabled={!canGoToPreviousWeek}>
              <ChevronLeftIcon />
            </WeekNavigationButton>

            <WeekInfo>
              <div className="title">{isCurrentWeek ? '本週壽星' : '當週壽星'}</div>
              <div className="date-range">
                {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
              </div>
            </WeekInfo>

            <WeekNavigationButton onClick={goToNextWeek}>
              <ChevronRightIcon />
            </WeekNavigationButton>
          </WeekNavigationContainer>

          {/* 搜尋區域 */}
          <SearchContainer>
            <MagnifyingGlassIcon />
            <SearchInput
              onClick={() => {
                setSearchModalOpen(true);
              }}
            >
              搜尋其他偶像
            </SearchInput>
          </SearchContainer>

          {/* 藝人列表區域 - 包含 loading 狀態 */}
          {loading ? (
            <LoadingContainer>
              <div className="spinner" />
              <p>載入當週壽星中...</p>
            </LoadingContainer>
          ) : weekBirthdayArtists.length > 0 ? (
            <ArtistList>
              {weekBirthdayArtists.map((artist) => {
                if (!artist.birthday) return null;
                return (
                  <>
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      handleArtistClick={handleArtistClick}
                    />
                  </>
                );
              })}
            </ArtistList>
          ) : (
            <EmptyState>
              <div className="icon">🎂</div>
              <h3>本週沒有壽星</h3>
              <p>可以切換到其他週查看，或點擊上方搜尋框尋找特定藝人</p>
            </EmptyState>
          )}

          {/* CTA 按鈕 */}
          <CTAButton
            onClick={() => {
              if (!user) {
                toggleAuthModal();
              } else {
                router.push('/submit-event');
              }
            }}
          >
            新增生咖
          </CTAButton>
        </ContentWrapper>
      </MainContainer>

      {/* 認證模態視窗 */}
      <AuthModal isOpen={authModalOpen} onClose={() => toggleAuthModal()} initialMode="signin" />

      {/* 搜尋模態視窗 */}
      <ArtistSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </PageContainer>
  );
}
