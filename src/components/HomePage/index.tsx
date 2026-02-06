'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
import { useEventFilters } from '@/hooks/useEventFilters';
import EventCardCarousel from '../EventCardCarousel';

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
  const [today] = useState(new Date().toISOString());
  const { user, toggleAuthModal } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const { currentWeekStart, goToPreviousWeek, goToNextWeek, isCurrentWeek, currentWeekEnd } =
    useWeekNavigation();

  const { activeTab, handleTabChange } = useTabState();

  const { weekBirthdayArtists, isLoading: isArtistsLoading } = useBirthdayArtists();
  const { weeklyEvents, isLoading: isEventsLoading } = useWeeklyEvents();
  const { data: events } = useEventFilters({
    status: 'approved',
    sortBy: 'startTime',
    sortOrder: 'asc',
    limit: 20,
    page: 1,
    // 從今天開始
    startTimeFrom: today,
  });

  return (
    <main className={pageContainer}>
      <div className={mainContainer}>
        <section className={contentWrapper} aria-label="每週壽星與生日應援">
          <IOSInstallBanner />
          <CTAButton
            onClick={() => {
              if (!user) {
                toggleAuthModal('/submit-event');
              } else {
                router.push('/submit-event');
              }
            }}
            ariaLabel="前往投稿生日應援"
          >
            <span>點擊投稿生日應援 ➡️</span>
          </CTAButton>

          <EventCardCarousel events={events ?? []} />

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
            <div role="tabpanel" id="birthday-panel" aria-labelledby="birthday-tab">
              <BirthdayTab
                artists={weekBirthdayArtists}
                loading={isArtistsLoading}
                onSearchClick={() => setSearchModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'events' && (
            <div role="tabpanel" id="events-panel" aria-labelledby="events-tab">
              <EventsTab events={weeklyEvents} loading={isEventsLoading} />
            </div>
          )}
        </section>
      </div>

      <ArtistSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </main>
  );
}

export default function HomePage() {
  return (
    <QueryStateProvider>
      <HomePageContent />
    </QueryStateProvider>
  );
}
