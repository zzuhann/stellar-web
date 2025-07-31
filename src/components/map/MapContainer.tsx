'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple, DivIcon, Point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store';

// 修復 Leaflet 預設圖標問題
delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 咖啡圖標
const coffeeIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" width="32" height="32">
      <path d="M2 21h18v-2H2v2zm1.15-4.05L4 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L8 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L12 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L16 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55l.85-1.48-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L16 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L12 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L8 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55l-.85 1.48zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

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

interface MapEvent {
  id: string;
  title: string;
  artistName: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'upcoming';
  thumbnail?: string;
}

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
  userLocation?: { lat: number; lng: number } | null;
}

export default function MapComponent({
  events = [],
  onEventSelect,
  userLocation,
}: MapComponentProps) {
  const { center, selectMarker } = useMapStore();
  const [isMounted, setIsMounted] = useState(false);

  // 確保在客戶端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 使用傳入的 events，不再在這裡篩選（篩選邏輯移到父組件）
  const displayEvents = events;

  const handleMarkerClick = (event: MapEvent) => {
    selectMarker(event.id);
    onEventSelect?.({ id: event.id });
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

        {/* 地圖事件監聽器 */}
        <MapEventHandler />

        {/* 地圖視圖控制器 */}
        <MapViewController center={center} zoom={center.zoom} />

        {/* 用戶位置標記 */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-semibold text-sm mb-1 text-blue-600">您的位置</h3>
                <div className="text-xs text-gray-600">
                  緯度: {userLocation.lat.toFixed(6)}
                  <br />
                  經度: {userLocation.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
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
          {displayEvents.map((event) => {
            return (
              <Marker
                key={event.id}
                position={[event.coordinates.lat, event.coordinates.lng]}
                icon={coffeeIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(event),
                }}
              >
                <Popup>
                  <div className="min-w-[200px] max-w-[300px]">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{event.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-purple-600">藝人：</span>
                        {event.artistName}
                      </div>
                      <div>
                        <span className="font-medium text-blue-600">狀態：</span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            event.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {event.status === 'active' ? '進行中' : '即將開始'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkerClick(event)}
                      className="mt-3 w-full bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors"
                    >
                      查看詳情
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
