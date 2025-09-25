'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Artist } from '@/types';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import {
  PageContainer,
  MainContainer,
  ContentWrapper,
} from '@/components/HomePage/components/styles';
import CTASection from '@/components/HomePage/components/CTASection';
import WeekNavigation from '@/components/HomePage/components/WeekNavigation';
import BirthdayTab from '@/components/HomePage/components/BirthdayTab';
import EventsTab from '@/components/HomePage/components/EventsTab';
import useWeekNavigation from './hook/useWeekNavigation';
import useTabState from './hook/useTabState';
import useWeeklyEvents from './hook/useWeeklyEvents';
import useBirthdayArtists from './hook/useBirthdayArtists';

const ArtistSearchModal = dynamic(() => import('@/components/search/ArtistSearchModal'), {
  ssr: false,
  loading: () => null,
});

function HomePageContent() {
  const router = useRouter();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const { currentWeekStart, goToPreviousWeek, goToNextWeek, isCurrentWeek, currentWeekEnd } =
    useWeekNavigation();

  const { activeTab, handleTabChange } = useTabState();

  const { weekBirthdayArtists, isLoading: isArtistsLoading } = useBirthdayArtists();
  const { weeklyEvents, isLoading: isEventsLoading } = useWeeklyEvents();

  const handleArtistClick = (artist: Artist) => {
    router.push(`/map/${artist.id}`);
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
              loading={isArtistsLoading}
              onSearchClick={() => setSearchModalOpen(true)}
              onArtistClick={handleArtistClick}
            />
          )}

          {activeTab === 'events' && <EventsTab events={weeklyEvents} loading={isEventsLoading} />}
        </ContentWrapper>
      </MainContainer>

      <ArtistSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </PageContainer>
  );
}

export default function HomePage() {
  return (
    <QueryStateProvider>
      <HomePageContent />
    </QueryStateProvider>
  );
}
