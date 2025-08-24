'use client';

import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  const backgroundImage = imageUrl || defaultImageUrl;

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
      overflow: hidden;
      background: white;
      position: relative;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
    ">
      <div style="
        width: 100%;
        height: 100%;
        background-image: url('${backgroundImage}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "></div>
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

  const totalHeight = size + 10;

  return new DivIcon({
    html: iconHtml,
    className: '',
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, totalHeight],
    popupAnchor: [0, -totalHeight],
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

const LoadingContent = styled.div`
  text-align: center;
`;

const LoadingSpinnerLarge = styled.div`
  width: 48px;
  height: 48px;
  border: 2px solid transparent;
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Memoized Marker 組件，防止不必要的重新渲染
const MemoizedMarker = memo(
  ({
    event,
    icon,
    onMarkerClick,
  }: {
    event: MapEvent;
    icon: DivIcon;
    onMarkerClick: (event: MapEvent) => void;
  }) => (
    <Marker
      key={event.id}
      position={[event.location.coordinates.lat, event.location.coordinates.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onMarkerClick(event),
      }}
    />
  )
);

MemoizedMarker.displayName = 'MemoizedMarker';

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

// 地圖中心點更新器組件
function MapCenterUpdater() {
  const { center } = useMapStore();
  const map = useMapEvents({});

  useEffect(() => {
    if (map && center) {
      map.setView([center.lat, center.lng], center.zoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [map, center.lat, center.lng, center.zoom]);

  return null;
}

interface MapComponentProps {
  events?: MapEvent[];
  onEventSelect?: (event: { id: string }) => void;
  onMarkerClick?: (eventId: string) => void;
  selectedEventId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  artistData?: { profileImage?: string; stageName?: string } | null;
}

export default function MapComponent({
  events = [],
  onEventSelect,
  onMarkerClick,
  selectedEventId,
  userLocation,
  artistData,
}: MapComponentProps) {
  const { center, selectMarker, setCenter } = useMapStore();
  const [isMounted, setIsMounted] = useState(false);
  const clusterGroupRef = useRef<any>(null);

  // 緩存所有 marker 圖標，只在相關數據變化時重新計算
  const markerIcons = useMemo(() => {
    const iconCache = new Map();

    events.forEach((event) => {
      const isSelected = selectedEventId === event.id;
      const cacheKey = `${event.mainImage || 'default'}_${isSelected}`;

      if (!iconCache.has(cacheKey)) {
        iconCache.set(cacheKey, createImageIcon(event.mainImage, isSelected));
      }
    });

    return iconCache;
  }, [events, selectedEventId]); // 只在 events 或 selectedEventId 變化時重新計算

  // 確保在客戶端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMarkerClick = (event: MapEvent) => {
    setCenter({
      lat: event.location.coordinates.lat,
      lng: event.location.coordinates.lng,
      zoom: 16,
    });
    selectMarker(event.id);
    onEventSelect?.({ id: event.id });
    onMarkerClick?.(event.id); // 調用 MapPage 的回調
  };

  // 處理聚合點擊事件
  const handleClusterClick = (event: any) => {
    const cluster = event.layer;
    const map = event.target._map;
    const currentZoom = map.getZoom();
    const clusterBounds = cluster.getBounds();
    const clusterCenter = clusterBounds.getCenter();

    const newZoom = Math.min(currentZoom + 2, 18);

    // 直接操作地圖，不使用動畫
    map.setView([clusterCenter.lat, clusterCenter.lng], newZoom, {
      animate: false,
    });

    // 同步更新 store
    setCenter({
      lat: clusterCenter.lat,
      lng: clusterCenter.lng,
      zoom: newZoom,
    });

    // 阻止預設行為
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
  };

  // 台灣地圖中心點
  const position: LatLngTuple = [center.lat, center.lng];

  if (!isMounted) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <LoadingSpinnerLarge />
          <p>載入中...</p>
        </LoadingContent>
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

        {/* 地圖中心點更新器 */}
        <MapCenterUpdater />

        {/* 用戶位置標記 */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
        )}

        {/* Marker 聚合群組 */}
        <MarkerClusterGroup
          ref={clusterGroupRef}
          // 控制聚合行為的選項
          maxClusterRadius={80} // 聚合半徑 (像素)，預設 80
          disableClusteringAtZoom={14} // 在此縮放等級以上停用聚合
          spiderfyOnMaxZoom={true} // 在最大縮放時展開 marker
          eventHandlers={{
            clusterclick: handleClusterClick,
          }}
          iconCreateFunction={(cluster: { getChildCount(): number }) => {
            const count = cluster.getChildCount();

            // 決定 cluster 大小
            let size = 50;
            let className = 'marker-cluster-small';

            if (count < 10) {
              size = 50;
              className = 'marker-cluster-small';
            } else if (count < 100) {
              size = 60;
              className = 'marker-cluster-medium';
            } else {
              size = 70;
              className = 'marker-cluster-large';
            }

            // 如果有 artist profileImage，使用自定義樣式
            if (artistData?.profileImage) {
              const html = `
                <div style="
                  width: ${size}px;
                  height: ${size}px;
                  border-radius: 50%;
                  background-image: url('${artistData.profileImage}');
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <div style="
                    background: rgba(0, 0, 0, 0.2);
                    // backdrop-filter: blur(2px);
                    color: #fff;
                    border-radius: 50%;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: bold;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  ">
                    ${count}
                  </div>
                </div>
              `;

              return new DivIcon({
                html: html,
                className: '',
                iconSize: new Point(size, size),
                iconAnchor: [size / 2, size / 2],
              });
            }

            // 預設樣式（沒有 artist profileImage 時）
            return new DivIcon({
              html: `<div><span>${count}</span></div>`,
              className: `marker-cluster ${className}`,
              iconSize: new Point(size, size),
            });
          }}
        >
          {events.map((event) => {
            const isSelected = selectedEventId === event.id;
            const cacheKey = `${event.mainImage || 'default'}_${isSelected}`;
            const cachedIcon = markerIcons.get(cacheKey);

            return (
              <MemoizedMarker
                key={event.id}
                event={event}
                icon={cachedIcon}
                onMarkerClick={handleMarkerClick}
              />
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </MapWrapper>
  );
}
