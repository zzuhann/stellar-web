'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { css } from '@/styled-system/css';
import useMapPageData from '@/components/map/hook/useMapPageData';
import useMapNewLocation from './hooks/useMapNewLocation';
import Loading from '@/components/Loading';
import MapNewHeader from './MapNewHeader';
import { MapEvent } from '@/types';

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

interface MapNewPageProps {
  artistId: string;
}

export default function MapNewPage({ artistId }: MapNewPageProps) {
  const { mapEvents, isMapLoading, artistData, isArtistLoading } = useMapPageData({
    propsArtistId: artistId,
  });

  const { latitude, longitude } = useMapNewLocation();

  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [_selectedLocationEvents, setSelectedLocationEvents] = useState<MapEvent[] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const hasAutoCenteredRef = useRef(false);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };

  // TODO: wire up to bottom sheet UI in next phase
  const handleSingleMarkerClick = (event: MapEvent) => {
    setSelectedEvent(event);
  };

  // TODO: wire up to bottom sheet UI in next phase
  const handleMultiMarkerClick = (events: MapEvent[]) => {
    setSelectedLocationEvents(events);
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
          />
        </div>
      </div>
    </>
  );
}
