'use client';

import dynamic from 'next/dynamic';
import { css } from '@/styled-system/css';
import useMapPageData from '@/components/map/hook/useMapPageData';
import useMapLocation from '@/components/map/hook/useMapLocation';
import Loading from '@/components/Loading';

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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

interface MapNewPageProps {
  artistId: string;
}

export default function MapNewPage({ artistId }: MapNewPageProps) {
  const { mapEvents, isMapLoading, artistData, isArtistLoading } = useMapPageData({
    propsArtistId: artistId,
  });

  const { latitude, longitude } = useMapLocation();

  if (isMapLoading || isArtistLoading) {
    return (
      <div className={loadingContainer}>
        <Loading description="載入中..." />
      </div>
    );
  }

  return (
    <div className={pageContainer} id="main-content">
      <div className={mapArea}>
        <MapSection
          mapEvents={mapEvents}
          artistData={artistData ?? null}
          latitude={latitude}
          longitude={longitude}
        />
      </div>
    </div>
  );
}
