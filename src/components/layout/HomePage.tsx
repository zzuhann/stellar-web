'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Artist, CoffeeEvent } from '@/types';
import { getDaysUntilBirthday } from '@/utils';
import { useBirthdayArtists, useWeeklyEvents } from '@/hooks/useHomePage';
import { getWeekStart, getWeekEnd, formatDateForAPI } from '@/utils/weekHelpers';
import { PageContainer, MainContainer, ContentWrapper } from '@/components/HomePage/styles';
import CTASection from '@/components/HomePage/CTASection';
import WeekNavigation from '@/components/HomePage/WeekNavigation';
import BirthdayTab from '@/components/HomePage/BirthdayTab';
import EventsTab from '@/components/HomePage/EventsTab';

const ArtistSearchModal = dynamic(() => import('@/components/search/ArtistSearchModal'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'birthday' | 'events'>('birthday');

  // 計算當週的開始和結束日期
  const weekStart = getWeekStart(currentWeekStart);
  const weekEnd = getWeekEnd(weekStart);
  const startDate = formatDateForAPI(weekStart);
  const endDate = formatDateForAPI(weekEnd);

  // 對於 events，使用今天作為開始時間，避免顯示已結束的活動
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventStartDate =
    currentWeekStart.getTime() === getWeekStart(new Date()).getTime()
      ? today.toISOString() // 如果是本週，從今天開始
      : weekStart.toISOString(); // 如果是其他週，從該週開始
  const endDateISO = new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();

  // 使用 React Query 獲取當週壽星
  const { data: artists = [], isLoading: loading } = useBirthdayArtists(
    startDate,
    endDate,
    undefined,
    { enabled: activeTab === 'birthday' }
  );

  // 使用 React Query 獲取當週生咖活動
  const { data: eventsResponse, isLoading: eventsLoading } = useWeeklyEvents(
    eventStartDate,
    endDateISO,
    { enabled: activeTab === 'events' }
  );
  const weeklyEvents = eventsResponse?.events || [];

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

  // 週導航
  const goToPreviousWeek = () => {
    // 如果是生咖tab，不能往回看到本週之前
    if (activeTab === 'events') {
      const thisWeekStart = getWeekStart(new Date());
      if (currentWeekStart.getTime() <= thisWeekStart.getTime()) {
        return; // 已經是本週或之前，不允許往回
      }
    }

    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // 判斷是否為當前週（用於顯示文字）
  const isCurrentWeek = useMemo(() => {
    const thisWeekStart = getWeekStart(new Date());
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  }, [currentWeekStart]);

  const handleArtistClick = (artist: Artist) => {
    router.push(`/map/${artist.id}`);
  };

  const handleEventClick = (event: CoffeeEvent) => {
    router.push(`/event/${event.id}`);
  };

  const handleTabChange = (tab: 'birthday' | 'events') => {
    setActiveTab(tab);

    // 如果切換到生咖tab且當前在看過去的週，自動跳回本週
    if (tab === 'events') {
      const thisWeekStart = getWeekStart(new Date());
      if (currentWeekStart.getTime() < thisWeekStart.getTime()) {
        setCurrentWeekStart(thisWeekStart);
      }
    }
  };

  return (
    <PageContainer>
      <MainContainer>
        <ContentWrapper>
          <CTASection />

          <WeekNavigation
            currentWeekStart={currentWeekStart}
            currentWeekEnd={currentWeekEnd}
            isCurrentWeek={isCurrentWeek}
            activeTab={activeTab}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onTabChange={handleTabChange}
          />

          {activeTab === 'birthday' && (
            <BirthdayTab
              artists={weekBirthdayArtists}
              loading={loading}
              onSearchClick={() => setSearchModalOpen(true)}
              onArtistClick={handleArtistClick}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab
              events={weeklyEvents}
              loading={eventsLoading}
              onEventClick={handleEventClick}
            />
          )}
        </ContentWrapper>
      </MainContainer>

      <ArtistSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </PageContainer>
  );
}
