'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { css } from '@/styled-system/css';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import useMapPageData from '@/components/map/hook/useMapPageData';
import useMapNewLocation from './hooks/useMapNewLocation';
import { useMapNewState } from './hooks/useMapNewState';
import Loading from '@/components/Loading';
import MapNewHeader from './MapNewHeader';
import MapBottomSheet from './MapBottomSheet';
import MapSingleEventCard from './MapSingleEventCard';
import EventList from './EventList';
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

const loadingContainer = css({
  height: '100dvh',
  width: '100%',
  maxWidth: '600px',
  mx: 'auto',
});

const locateButton = css({
  position: 'fixed',
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
  const { mapEvents, isMapLoading, artistData, isArtistLoading } = useMapPageData({
    propsArtistId: artistId,
  });

  const { latitude, longitude } = useMapNewLocation();

  const {
    mode,
    selectedEvent,
    selectedLocationEvents,
    selectEvent,
    selectLocation,
    clearSelection,
    setMode,
  } = useMapNewState();
  const mapRef = useRef<L.Map | null>(null);
  const hasAutoCenteredRef = useRef(false);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };

  const handleSingleMarkerClick = (event: MapEvent) => {
    selectEvent(event);
  };

  const handleMultiMarkerClick = (events: MapEvent[]) => {
    selectLocation(events);
  };

  // Prevent body scroll so global Footer doesn't appear below the map
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Auto-center map to user GPS position on first acquisition
  useEffect(() => {
    if (hasAutoCenteredRef.current) return;
    if (latitude && longitude && mapRef.current) {
      hasAutoCenteredRef.current = true;
      mapRef.current.setView([latitude, longitude], 8);
    }
  }, [latitude, longitude]);

  if (isMapLoading || isArtistLoading) {
    return (
      <div className={loadingContainer}>
        <Loading description="載入中..." style={{ width: '100%' }} />
      </div>
    );
  }

  const artistName = artistData?.stageNameZh ?? artistData?.stageName ?? '';

  const displayEvents = selectedLocationEvents ?? mapEvents;

  return (
    <>
      <MapNewHeader artistName={artistName} />
      <div className={pageContainer} id="main-content">
        <div className={mapArea}>
          <MapSection
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
          style={{ bottom: '148px' }}
          aria-label="查看全部活動"
          onClick={() => {
            mapRef.current?.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
          }}
        >
          <ArrowsPointingOutIcon width={20} height={20} />
        </button>
        {mode === 'map' && selectedEvent && (
          <MapSingleEventCard event={selectedEvent} onDismiss={() => selectEvent(null)} />
        )}
        {mode === 'map' && !selectedEvent && (
          <MapBottomSheet
            events={displayEvents}
            onRequestListMode={() => setMode('list')}
            isLocationFiltered={!!selectedLocationEvents}
            onClearLocationFilter={clearSelection}
          />
        )}
        {mode === 'list' && (
          <EventList
            events={displayEvents}
            onBackToMap={() => setMode('map')}
            isLocationFiltered={!!selectedLocationEvents}
            onClearLocationFilter={clearSelection}
          />
        )}
      </div>
    </>
  );
}
