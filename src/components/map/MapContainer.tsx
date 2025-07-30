'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore, useEventStore } from '@/store';
import { CoffeeEvent } from '@/types';

// 修復 Leaflet 預設圖標問題
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 咖啡圖標
const coffeeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" width="32" height="32">
      <path d="M2 21h18v-2H2v2zm1.15-4.05L4 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L8 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L12 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L16 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55l.85-1.48-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L16 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L12 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L8 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55l-.85 1.48zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapComponentProps {
  events?: CoffeeEvent[];
  onEventSelect?: (event: CoffeeEvent) => void;
}

export default function MapComponent({ events = [], onEventSelect }: MapComponentProps) {
  const { center, setCenter, selectMarker, selectedMarkerId } = useMapStore();
  const [isMounted, setIsMounted] = useState(false);

  // 確保在客戶端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 篩選未結束的活動
  const activeEvents = events.filter(event => {
    const now = new Date();
    const endDate = new Date(event.endDate);
    return endDate >= now;
  });

  const handleMarkerClick = (event: CoffeeEvent) => {
    selectMarker(event.id);
    onEventSelect?.(event);
  };

  // 台灣地圖中心點
  const position: LatLngTuple = [center.lat, center.lng];

  if (!isMounted) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">載入地圖中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg relative z-0">
      <MapContainer
        center={position}
        zoom={center.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {activeEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.coordinates.lat, event.location.coordinates.lng]}
            icon={coffeeIcon}
            eventHandlers={{
              click: () => handleMarkerClick(event),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}