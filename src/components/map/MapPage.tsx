'use client';

import useMapPageData from './hook/useMapPageData';
import useMapLocation from './hook/useMapLocation';
import useDrawer from './hook/useDrawer';
import { useMapStore } from '@/store';
import Loading from '../Loading';
import { css } from '@/styled-system/css';
import LocationError from './components/LocationError';
import Drawer from './components/Drawer';
import { TileLayer, Marker } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createUserLocationIcon } from './utils/userLocationIcon';
import MapEventHandler from './components/MapEventHandler';
import MapCenterUpdater from './components/MapCenterUpdater';
import MarkerCluster from './components/MarkerCluster';
import SafeMapContainer from './components/SafeMapContainer';
import { initializeLeafletIcons } from './utils/leaflet-icons';

// 初始化 Leaflet 圖標
initializeLeafletIcons();

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  position: 'relative',
});

const mainContainer = css({
  position: 'relative',
  height: '100vh',
  paddingTop: '70px',
});

const mapSection = css({
  position: 'absolute',
  inset: '0',
  top: '70px',
});

const mapContainer = css({
  height: '100%',
  background: 'color.background.primary',
  position: 'relative',
  overflow: 'hidden',
});

const mapInner = css({
  position: 'absolute',
  inset: '0',
  overflow: 'hidden',
});

const mapWrapper = css({
  width: '100%',
  height: '100%',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  boxShadow: 'shadow.md',
  position: 'relative',
  zIndex: 0,
});

const loadingContainer = css({
  height: '100vh',
});

interface MapPageProps {
  artistId?: string;
  search?: string;
}

export default function MapPage({
  artistId: propsArtistId,
  search: propsSearch,
}: MapPageProps = {}) {
  const center = useMapStore((state) => state.center);
  const position: LatLngTuple = [center.lat, center.lng]; // 地圖中心點座標
  const { latitude, longitude, locationError } = useMapLocation();
  const userLocationIcon = createUserLocationIcon();

  const { mapEvents, isMapLoading, artistData, isArtistLoading } = useMapPageData({
    propsSearch,
    propsArtistId,
  });

  const { springs, bind } = useDrawer();

  if (isMapLoading || isArtistLoading) {
    return (
      <div className={loadingContainer}>
        <Loading description="載入中..." />
      </div>
    );
  }

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        {/* 地圖區域 */}
        <div className={mapSection}>
          <div className={mapContainer}>
            <div className={mapInner}>
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

                  {/* 地圖事件監聽器 */}
                  <MapEventHandler />

                  {/* 地圖中心點更新器 */}
                  <MapCenterUpdater />

                  {/* 用戶位置標記 */}
                  {latitude && longitude && userLocationIcon && (
                    <Marker position={[latitude, longitude]} icon={userLocationIcon} />
                  )}

                  {/* Marker 聚合群組 */}
                  <MarkerCluster mapEvents={mapEvents} artistData={artistData ?? null} />
                </SafeMapContainer>
              </div>
            </div>

            {locationError && <LocationError locationError={locationError} />}
          </div>
        </div>

        <Drawer
          springs={springs}
          bind={bind}
          artistData={artistData ?? null}
          mapEvents={mapEvents}
        />
      </div>
    </div>
  );
}
