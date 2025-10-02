'use client';

import EventCard from '@/components/EventCard';
import { css } from '@/styled-system/css';
import { Artist, MapEvent } from '@/types';
import { useRouter } from 'next/navigation';
import EmptyState from '../EmptyState';
import CTAButton from '@/components/CTAButton';
import { useMapStore } from '@/store';
import useMapSelection from '../../hook/useMapSelection';
import IOSInstallBanner from '@/components/pwa/IOSInstallBanner';

const drawerContent = css({
  height: 'calc(100% - 80px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const eventList = css({
  flex: '1',
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

type DrawerContentProps = {
  mapEvents: MapEvent[];
  artistData: Artist | null;
};

const DrawerContent = ({ mapEvents, artistData }: DrawerContentProps) => {
  const router = useRouter();
  const { selectedEventId } = useMapStore();

  const { selectedLocationEvents, isLocationSelected } = useMapSelection();

  const displayEvents = selectedEventId
    ? mapEvents.filter((event) => event.id === selectedEventId)
    : isLocationSelected
      ? selectedLocationEvents
      : mapEvents;

  return (
    <div className={drawerContent}>
      <div className={eventList}>
        {displayEvents.length > 0 ? (
          displayEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <>
            <EmptyState artistData={artistData ?? null} />
            <CTAButton
              onClick={() => {
                router.push('/submit-event');
              }}
            >
              是生日應援主辦嗎? <br />
              前往新增生日應援
            </CTAButton>
          </>
        )}
        <IOSInstallBanner />
      </div>
    </div>
  );
};

export default DrawerContent;
