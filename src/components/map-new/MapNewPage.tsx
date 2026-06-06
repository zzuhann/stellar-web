'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import useMapPageData from '@/components/map/hook/useMapPageData';
import useMapNewLocation from './hooks/useMapNewLocation';
import { useMapNewState } from './hooks/useMapNewState';
import { useMapStateStorage } from './hooks/useMapStateStorage';
import MapNewHeader from './MapNewHeader';
import MapBottomSheet from './MapBottomSheet';
import MapSingleEventCard from './MapSingleEventCard';
import { MapEvent } from '@/types';

import { DEFAULT_CENTER, DEFAULT_ZOOM } from './constants';

// Leaflet requires client-side only rendering
const MapSection = dynamic(() => import('./MapSection'), { ssr: false });

const pageContainer = css({
  maxWidth: '600px',
  mx: 'auto',
  height: '100dvh',
  overflow: 'hidden',
  position: 'relative',
  background: 'color.background.primary',
});

const mapArea = css({
  position: 'absolute',
  inset: '0',
  top: '70px',
});

const locateButton = css({
  position: 'absolute',
  right: '4',
  width: '44px',
  height: '44px',
  borderRadius: 'radius.circle',
  background: 'color.background.secondary',
  boxShadow: 'shadow.md',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  borderColor: 'color.border.light',
  cursor: 'pointer',
  color: 'color.text.secondary',
  zIndex: '10',
});

interface MapNewPageProps {
  artistId: string;
}

export default function MapNewPage({ artistId }: MapNewPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { mapEvents, isMapLoading, artistData, isArtistLoading } = useMapPageData({
    propsArtistId: artistId,
  });

  const { latitude, longitude } = useMapNewLocation();

  const { saveState, consumeRestoredState } = useMapStateStorage(artistId);
  const [restoredState, setRestoredState] = useState(() => consumeRestoredState());
  const [sheetHeight, setSheetHeight] = useState(120);

  const handleMapBeforeNavigate = useCallback(
    (savedSheetHeight: number, carouselScrollLeft: number) => {
      saveState({ sheetHeight: savedSheetHeight, carouselScrollLeft });
    },
    [saveState]
  );

  const { selectedEvent, selectedLocationEvents, selectEvent, selectLocation, clearSelection } =
    useMapNewState();
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };

  const handleSingleMarkerClick = (event: MapEvent) => {
    sendGAEvent('event', 'click_map_marker', {
      event_page: '/map-new/[artistId]',
      user_id: user?.uid ?? '',
      content_id: event.id,
      artist_id: artistId,
    });
    selectEvent(event);
  };

  const handleMultiMarkerClick = (events: MapEvent[]) => {
    sendGAEvent('event', 'map_location_filter_apply', {
      event_page: '/map-new/[artistId]',
      user_id: user?.uid ?? '',
      content_id: artistId,
      location_name: events[0]?.location?.name ?? events[0]?.location?.city ?? '',
    });
    selectLocation(events);
  };

  // Prevent body scroll so global Footer doesn't appear below the map
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!isMapLoading && !isArtistLoading && !artistData) {
      router.replace('/');
    }
  }, [isMapLoading, isArtistLoading, artistData, router]);

  if (!isMapLoading && !isArtistLoading && !artistData) return null;

  const isLoading = isMapLoading || isArtistLoading;
  const artistName = artistData?.stageNameZh ?? artistData?.stageName ?? '';

  const displayEvents = selectedLocationEvents ?? mapEvents;

  return (
    <>
      <MapNewHeader artistName={artistName} isLoading={isLoading} />
      <div className={pageContainer} id="main-content">
        <div className={mapArea}>
          <MapSection
            artistId={artistId}
            mapEvents={mapEvents}
            artistData={artistData ?? null}
            latitude={latitude}
            longitude={longitude}
            selectedEventId={selectedEvent?.id ?? null}
            onSingleMarkerClick={handleSingleMarkerClick}
            onMultiMarkerClick={handleMultiMarkerClick}
            onMapReady={handleMapReady}
            onClearSelection={clearSelection}
          />
        </div>
        <button
          type="button"
          className={locateButton}
          style={{ bottom: `${selectedEvent ? 148 : sheetHeight + 28}px` }}
          aria-label="查看全部活動"
          onClick={() => {
            sendGAEvent('event', 'map_reset_view', {
              event_page: '/map-new/[artistId]',
              user_id: user?.uid ?? '',
              content_id: artistId,
            });
            mapRef.current?.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
          }}
        >
          <ArrowsPointingOutIcon width={20} height={20} />
        </button>
        {selectedEvent && (
          <MapSingleEventCard
            event={selectedEvent}
            artistId={artistId}
            onDismiss={() => selectEvent(null)}
          />
        )}
        {!selectedEvent && (
          <MapBottomSheet
            artistId={artistId}
            events={displayEvents}
            isLocationFiltered={!!selectedLocationEvents}
            onClearLocationFilter={clearSelection}
            isLoading={isLoading}
            initialHeight={restoredState?.sheetHeight}
            initialCarouselScrollLeft={restoredState?.carouselScrollLeft}
            onBeforeNavigate={handleMapBeforeNavigate}
            onRestoredStateConsumed={() => setRestoredState(null)}
            onHeightChange={setSheetHeight}
          />
        )}
      </div>
    </>
  );
}
