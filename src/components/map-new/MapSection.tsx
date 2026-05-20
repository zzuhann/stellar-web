'use client';

import { useEffect, useState } from 'react';
import { TileLayer, Marker, MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { css } from '@/styled-system/css';
import { Artist, MapEvent } from '@/types';
import { initializeLeafletIcons } from '@/components/map/utils/leaflet-icons';
import { createUserLocationIcon } from '@/components/map/utils/userLocationIcon';
import MarkerLayer from './MarkerLayer';

initializeLeafletIcons();

const DEFAULT_CENTER: [number, number] = [23.5, 121.0];
const DEFAULT_ZOOM = 8;

const mapWrapper = css({
  width: '100%',
  height: '100%',
});

interface MapSectionProps {
  mapEvents: MapEvent[];
  artistData: Artist | null;
  latitude: number | null;
  longitude: number | null;
  selectedEventId: string | null;
  onSingleMarkerClick: (event: MapEvent) => void;
  onMultiMarkerClick: (events: MapEvent[]) => void;
  onMapReady: (map: L.Map) => void;
  onClearSelection: () => void;
}

// Internal component: captures map instance and signals when panes are ready
const MapReadyCapture = ({
  onMapReady,
  onReady,
}: {
  onMapReady: (map: L.Map) => void;
  onReady: () => void;
}) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default function MapSection({
  mapEvents,
  artistData,
  latitude,
  longitude,
  selectedEventId,
  onSingleMarkerClick,
  onMultiMarkerClick,
  onMapReady,
  onClearSelection,
}: MapSectionProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const userLocationIcon = createUserLocationIcon();

  return (
    <div className={`${mapWrapper} map-new-map`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapReadyCapture onMapReady={onMapReady} onReady={() => setIsMapReady(true)} />

        {isMapReady && (
          <>
            <TileLayer
              maxZoom={19}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {latitude && longitude && userLocationIcon && (
              <Marker
                position={[latitude, longitude]}
                icon={userLocationIcon}
                title="我的位置"
                alt="我的位置"
              />
            )}

            <MarkerLayer
              mapEvents={mapEvents}
              artistData={artistData}
              selectedEventId={selectedEventId}
              onSingleMarkerClick={onSingleMarkerClick}
              onMultiMarkerClick={onMultiMarkerClick}
              onClearSelection={onClearSelection}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
