'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Artist } from '@/types';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import WeekNavigation from '@/components/HomePage/components/WeekNavigation';
import BirthdayTab from '@/components/HomePage/components/BirthdayTab';
import EventsTab from '@/components/HomePage/components/EventsTab';
import useWeekNavigation from './hook/useWeekNavigation';
import useTabState from './hook/useTabState';
import useWeeklyEvents from './hook/useWeeklyEvents';
import useBirthdayArtists from './hook/useBirthdayArtists';
import { css } from '@/styled-system/css';
import CTAButton from '@/components/CTAButton';
import { useAuth } from '@/lib/auth-context';
import IOSInstallBanner from '@/components/pwa/IOSInstallBanner';

const ArtistSearchModal = dynamic(() => import('@/components/search/ArtistSearchModal'), {
  ssr: false,
  loading: () => null,
});

export const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const mainContainer = css({
  paddingTop: '100px',
  maxWidth: '600px',
  padding: '100px 30px 40px',
  margin: '0 auto',
  width: '100%',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

export const contentWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

function HomePageContent() {
  const router = useRouter();
  const { user, toggleAuthModal } = useAuth();
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
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={contentWrapper}>
          <IOSInstallBanner />
          <CTAButton
            onClick={() => {
              if (!user) {
                toggleAuthModal('/submit-event');
              } else {
                router.push('/submit-event');
              }
            }}
          >
            生日應援主辦 ✨
            <br />
            前往投稿生日應援 ➡️
          </CTAButton>

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
        </div>
      </div>

      <ArtistSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}

export default function HomePage() {
  return (
    <QueryStateProvider>
      <HomePageContent />
    </QueryStateProvider>
  );
}
