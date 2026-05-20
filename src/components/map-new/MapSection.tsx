'use client';

import { TileLayer, Marker } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/useMapStore';
import SafeMapContainer from '@/components/map/components/SafeMapContainer';
import MarkerCluster from '@/components/map/components/MarkerCluster';
import MapEventHandler from '@/components/map/components/MapEventHandler';
import MapCenterUpdater from '@/components/map/components/MapCenterUpdater';
import { createUserLocationIcon } from '@/components/map/utils/userLocationIcon';
import { initializeLeafletIcons } from '@/components/map/utils/leaflet-icons';
import { css } from '@/styled-system/css';
import { Artist, MapEvent } from '@/types';

initializeLeafletIcons();

const mapWrapper = css({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 0,
});

interface MapSectionProps {
  mapEvents: MapEvent[];
  artistData: Artist | null;
  latitude: number | null;
  longitude: number | null;
}

export default function MapSection({
  mapEvents,
  artistData,
  latitude,
  longitude,
}: MapSectionProps) {
  const center = useMapStore((state) => state.center);
  const position: LatLngTuple = [center.lat, center.lng];
  const userLocationIcon = createUserLocationIcon();

  return (
    <div className={mapWrapper}>
      <SafeMapContainer
        center={position}
        zoom={center.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map event listener for user drag */}
        <MapEventHandler />

        {/* Keeps map view in sync with store center */}
        <MapCenterUpdater />

        {/* User location marker */}
        {latitude && longitude && userLocationIcon && (
          <Marker
            position={[latitude, longitude]}
            icon={userLocationIcon}
            title="我的位置"
            alt="我的位置"
          />
        )}

        {/* Clustered event markers */}
        <MarkerCluster mapEvents={mapEvents} artistData={artistData} />
      </SafeMapContainer>
    </div>
  );
}
