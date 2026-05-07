'use client';

import { useState, useRef } from 'react';
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
import IOSInstallBanner from '@/components/pwa/IOSInstallBanner';
// import EventCardCarousel from '../EventCardCarousel';
import TrendingEventsSection from '@/components/HomePage/components/TrendingEventsSection';
import TopArtistsSection from '@/components/HomePage/components/TopArtistsSection';
import { usePageView } from '@/hooks/usePageView';

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
  maxWidth: '600px',
  paddingTop: '25',
  paddingX: '8',
  paddingBottom: '10',
  margin: '0 auto',
  width: '100%',
  '@media (min-width: 768px)': {
    paddingX: '6',
    paddingBottom: '15',
  },
});

export const contentWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

function HomePageContent() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  usePageView({ eventPage: '/' });

  const { currentWeekStart, goToPreviousWeek, goToNextWeek, isCurrentWeek, currentWeekEnd } =
    useWeekNavigation();

  const { activeTab, handleTabChange } = useTabState();

  const { weekBirthdayArtists, isLoading: isArtistsLoading } = useBirthdayArtists();
  const { weeklyEvents, isLoading: isEventsLoading } = useWeeklyEvents();

  return (
    <main className={pageContainer} id="main-content">
      <div className={mainContainer}>
        <section className={contentWrapper} aria-label="首頁">
          <IOSInstallBanner />

          {/* 熱門生咖、生日應援 */}
          <TrendingEventsSection />

          {/* 擁有最多生咖的藝人 */}
          <TopArtistsSection />

          <section aria-label="每週壽星與生日應援">
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
                  searchTriggerRef={searchTriggerRef}
                />
              </div>
            )}

            {activeTab === 'events' && (
              <div role="tabpanel" id="events-panel" aria-labelledby="events-tab">
                <EventsTab events={weeklyEvents} loading={isEventsLoading} />
              </div>
            )}
          </section>
        </section>
      </div>

      <ArtistSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        triggerRef={searchTriggerRef}
      />
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
