'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple, DivIcon, Point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store';
import { MapEvent } from '@/types';
import styled from 'styled-components';

// 修復 Leaflet 預設圖標問題 - 只在客戶端執行
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// 創建自定義圖片 marker 的函數
const createImageIcon = (imageUrl?: string, isSelected = false) => {
  // 預設圖片 (如果沒有 mainImage)
  const defaultImageUrl =
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" width="40" height="40">
      <path d="M2 21h18v-2H2v2zm1.15-4.05L4 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L8 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L12 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L16 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55l.85-1.48-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L16 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L12 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L8 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55l-.85 1.48zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/>
    </svg>
  `);

  const size = isSelected ? 60 : 40;
  const borderWidth = isSelected ? 5 : 3;

  const iconHtml = `
   <div style="
      position: absolute;
      bottom: ${isSelected ? -6 : 3}px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: ${isSelected ? 10 : 6}px solid transparent;
      border-right: ${isSelected ? 10 : 6}px solid transparent;
      border-top: ${isSelected ? 12 : 8}px solid white;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    "></div>
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${borderWidth}px solid white;
      // box-shadow: 0 ${isSelected ? 6 : 2}px ${isSelected ? 16 : 8}px rgba(0,0,0,${isSelected ? 0.5 : 0.3});
      overflow: hidden;
      background: white;
      position: relative;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
    ">
      <img 
        src="${imageUrl || defaultImageUrl}" 
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        "
        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
      />
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: none;
        font-size: 20px;
      ">☕</div>
    </div>
   
  `;

  const totalHeight = size + 10; // marker 高度 + 箭頭高度

  return new DivIcon({
    html: iconHtml,
    className: '',
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, totalHeight], // 錨點在底部中央
    popupAnchor: [0, -totalHeight], // popup 出現在 marker 上方
  });
};

// 用戶位置圖標
const userLocationIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" opacity="0.3"/>
      <circle cx="12" cy="12" r="4" fill="#3B82F6"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Styled Components
const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  position: relative;
  z-index: 0;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 14px;
`;

// 地圖事件監聽器組件
function MapEventHandler() {
  const { setCenter } = useMapStore();
  const [isUserDragging, setIsUserDragging] = useState(false);

  useMapEvents({
    dragstart: () => {
      setIsUserDragging(true);
    },
    moveend: (e) => {
      // 只有在用戶手動拖動後才更新 store
      if (isUserDragging) {
        const map = e.target;
        const center = map.getCenter();
        const zoom = map.getZoom();

        // 同步更新 store 中的 center 狀態
        setCenter({
          lat: center.lat,
          lng: center.lng,
          zoom: zoom,
        });

        setIsUserDragging(false);
      }
    },
  });

  return null;
}

// 地圖視圖更新組件
function MapViewController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    // 使用 flyTo 提供平滑的動畫效果
    map.flyTo([center.lat, center.lng], zoom, {
      duration: 1.5, // 動畫持續時間
    });
  }, [map, center.lat, center.lng, zoom]);

  return null;
}

interface MapComponentProps {
  events?: MapEvent[];
  onEventSelect?: (event: { id: string }) => void;
  onMarkerClick?: (eventId: string) => void;
  selectedEventId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
}

export default function MapComponent({
  events = [],
  onEventSelect,
  onMarkerClick,
  selectedEventId,
  userLocation,
}: MapComponentProps) {
  const { center, selectMarker, setCenter } = useMapStore();
  const [isMounted, setIsMounted] = useState(false);

  // 確保在客戶端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMarkerClick = (event: MapEvent) => {
    setCenter({
      lat: event.location.coordinates.lat,
      lng: event.location.coordinates.lng,
      zoom: 15,
    });
    selectMarker(event.id);
    onEventSelect?.({ id: event.id });
    onMarkerClick?.(event.id); // 調用 MapPage 的回調
  };

  // 台灣地圖中心點
  const position: LatLngTuple = [center.lat, center.lng];

  if (!isMounted) {
    return (
      <LoadingContainer>
        <div>載入地圖中...</div>
      </LoadingContainer>
    );
  }

  return (
    <MapWrapper>
      <MapContainer
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

        {/* 地圖事件監聽器 */}
        <MapEventHandler />

        {/* 地圖視圖控制器 */}
        <MapViewController center={center} zoom={center.zoom} />

        {/* 用戶位置標記 */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
        )}

        {/* Marker 聚合群組 */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster: { getChildCount(): number }) => {
            const count = cluster.getChildCount();
            let className = 'marker-cluster-small';

            if (count < 10) {
              className = 'marker-cluster-small';
            } else if (count < 100) {
              className = 'marker-cluster-medium';
            } else {
              className = 'marker-cluster-large';
            }

            return new DivIcon({
              html: `<div><span>${count}</span></div>`,
              className: `marker-cluster ${className}`,
              iconSize: new Point(40, 40),
            });
          }}
        >
          {events.map((event) => {
            const isSelected = selectedEventId === event.id;
            return (
              <Marker
                key={event.id}
                position={[event.location.coordinates.lat, event.location.coordinates.lng]}
                icon={createImageIcon(event.mainImage, isSelected)}
                eventHandlers={{
                  click: () => handleMarkerClick(event),
                }}
              />
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </MapWrapper>
  );
}
