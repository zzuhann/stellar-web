'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useMapStore } from '@/store';
import MapComponent from '@/components/map/MapContainer';
import { useMapData } from '@/hooks/useMapData';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useArtist } from '@/hooks/useArtist';
import Header from './Header';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
  position: relative;
`;

const MainContainer = styled.div`
  position: relative;
  height: 100vh;
  padding-top: 70px;
`;

const MapSection = styled.div`
  position: absolute;
  inset: 0;
  top: 70px;
`;

const MapContainer = styled.div`
  height: 100%;
  background: var(--color-bg-primary);
  position: relative;
  overflow: hidden;
`;

const MapInner = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

// 底部拖拉式列表
const BottomDrawer = styled(animated.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const DrawerHandle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 75px;
  cursor: grab;
  gap: 12px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-primary);
  border-radius: 16px 16px 0 0;
  user-select: none;
  touch-action: none;
  position: relative;

  &:active {
    cursor: grabbing;
  }
`;

const HandleBarTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HandleBarText = styled.p`
  font-size: 14px;
  color: var(--color-text-primary);
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background: var(--color-border-medium);
  border-radius: 2px;
`;

const DrawerContent = styled.div`
  height: calc(100% - 60px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const EventList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
`;

const EventItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-bg-secondary);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const EventTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
`;

const EventLocation = styled.p`
  margin: 0 0 6px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.3;
`;

const EventDate = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--color-text-disabled);
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const LocationButton = styled.button<{
  loading?: boolean;
  hasLocation?: boolean;
  visible?: boolean;
}>`
  position: absolute;
  bottom: 100px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: ${(props) => (props.loading ? 'not-allowed' : 'pointer')};
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: ${(props) => (props.visible ? 'scale(1)' : 'scale(0.8)')};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};

  &:hover:not(:disabled) {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-medium);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorAlert = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  padding: 12px;
  max-width: 336px;
  border-radius: var(--radius-lg);
  background: rgba(254, 242, 242, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(252, 165, 165, 0.4);
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ErrorIcon = styled.div`
  color: #ef4444;
  font-size: 14px;
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #b91c1c;

  .title {
    font-weight: 500;
  }

  .message {
    font-size: 12px;
    margin-top: 4px;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
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

const ProfileImageContainer = styled.div<{ imageUrl: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export default function MapPageStyled() {
  const { center, setCenter } = useMapStore();
  const searchParams = useSearchParams();

  // 地理位置功能
  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
  } = useGeolocation({ autoGetPosition: true });

  const search = searchParams?.get('search') || '';
  const artistId = searchParams?.get('artistId') || '';

  // 使用新的 API hooks - MVP 階段先全部載入
  const { data: mapData, isLoading: mapLoading } = useMapData({
    status: 'all',
    search,
    artistId,
    // 暫時不使用地圖視窗篩選，先觀察流量情況
  });

  // 當有 artistId 時，獲取藝人詳細資料
  const { data: artistData, isLoading: artistLoading } = useArtist(artistId);

  // 標記是否應該自動定位到用戶位置
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);

  // 追蹤當前抽屜高度
  const [currentDrawerHeight, setCurrentDrawerHeight] = useState(75);

  // 計算地圖中心點與用戶位置的距離
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // 地球半徑（公里）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 兩段高度設定
  const COLLAPSED_HEIGHT = 75; // 收合高度
  const EXPANDED_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.75 : 500; // 展開高度

  // React Spring 動畫 - 使用內建 config
  const [springs, api] = useSpring(() => ({
    height: COLLAPSED_HEIGHT,
    config: config.gentle,
    // 暫時註解掉 onChange，看看是否干擾動畫
    // onChange: (result) => {
    //   // 監聽動畫變化，更新當前高度
    //   setCurrentDrawerHeight(result.value.height);
    // },
  }));

  // 判斷是否應該顯示定位按鈕
  const shouldShowLocationButton = () => {
    if (!latitude || !longitude) return false;
    if (currentDrawerHeight !== COLLAPSED_HEIGHT) return false;

    const distance = calculateDistance(center.lat, center.lng, latitude, longitude);

    // 如果距離超過 1 公里，顯示定位按鈕
    return distance > 1;
  };

  // 當獲取到用戶位置時，自動更新地圖中心（僅第一次）
  useEffect(() => {
    if (latitude && longitude && setCenter && shouldAutoCenter) {
      setCenter({ lat: latitude, lng: longitude, zoom: 13 });
      setShouldAutoCenter(false); // 只自動定位一次
    }
  }, [latitude, longitude, setCenter, shouldAutoCenter]);

  // 處理定位到我的位置
  const handleLocateMe = () => {
    if (latitude && longitude) {
      setCenter({ lat: latitude, lng: longitude, zoom: 13 });
    }
  };

  // 跟隨拖拽的兩段式邏輯
  const bind = (() => {
    let startY = 0;
    let startHeight = 0;
    let isDragging = false;

    const onStart = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isDragging = true;
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startHeight = springs.height.get();
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = (startY - clientY) * 1; // 向上為正值，提高敏感度讓拖拽更輕鬆
      const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, startHeight + deltaY));

      // 即時跟隨拖拽
      api.start({ height: newHeight, immediate: true });
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      // 根據起始狀態使用不同的閾值
      const currentHeight = springs.height.get();
      const totalRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;

      let shouldExpand;
      if (startHeight <= COLLAPSED_HEIGHT + 50) {
        // 從收合狀態開始：30% 就展開
        const expandThreshold = totalRange * 0.3;
        shouldExpand = currentHeight > COLLAPSED_HEIGHT + expandThreshold;
      } else {
        // 從展開狀態開始：需要拖到 70% 以下才縮合
        const collapseThreshold = totalRange * 0.7;
        shouldExpand = currentHeight > COLLAPSED_HEIGHT + collapseThreshold;
      }

      if (shouldExpand) {
        api.start({
          height: EXPANDED_HEIGHT,
          config: config.gentle,
          immediate: false,
          onRest: () => setCurrentDrawerHeight(EXPANDED_HEIGHT),
        });
      } else {
        api.start({
          height: COLLAPSED_HEIGHT,
          config: config.gentle,
          immediate: false,
          onRest: () => setCurrentDrawerHeight(COLLAPSED_HEIGHT),
        });
      }
    };

    // 統一的事件處理
    const handleMouseDown = (e: React.MouseEvent) => {
      onStart(e);

      const cleanup = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      const handleMouseUp = () => {
        onEnd();
        cleanup();
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      onStart(e);

      const cleanup = () => {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      const handleTouchEnd = () => {
        onEnd();
        cleanup();
      };

      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    return { handleMouseDown, handleTouchStart };
  })();

  if (mapLoading || artistLoading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <LoadingSpinnerLarge />
          <p>載入中...</p>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  // 使用新的資料結構
  const mapEvents = mapData?.events || [];

  return (
    <PageContainer>
      {/* Header */}
      <Header />

      {/* 主容器 */}
      <MainContainer>
        {/* 地圖區域 */}
        <MapSection>
          <MapContainer>
            <MapInner>
              <MapComponent
                events={mapEvents}
                userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
              />
            </MapInner>

            {locationError && (
              <ErrorAlert>
                <ErrorContent>
                  <ErrorIcon>⚠️</ErrorIcon>
                  <ErrorText>
                    <div className="title">定位失敗</div>
                    <div className="message">{locationError}</div>
                  </ErrorText>
                </ErrorContent>
              </ErrorAlert>
            )}
          </MapContainer>
        </MapSection>

        {/* 底部拖拉式列表 */}
        <BottomDrawer style={springs}>
          <LocationButton
            onClick={handleLocateMe}
            disabled={locationLoading}
            loading={locationLoading}
            hasLocation={!!(latitude && longitude)}
            visible={shouldShowLocationButton()}
          >
            {locationLoading ? <LoadingSpinner /> : <MapPinIcon />}
          </LocationButton>
          <DrawerHandle onMouseDown={bind.handleMouseDown} onTouchStart={bind.handleTouchStart}>
            <HandleBar />
            <HandleBarTextContainer>
              <ProfileImageContainer imageUrl={artistData?.profileImage || ''} />
              <HandleBarText>
                {artistData?.stageName} |{' '}
                {mapEvents.length > 0
                  ? `目前有 ${mapEvents.length} 個生咖活動`
                  : '目前沒有正在舉行的生咖'}
              </HandleBarText>
            </HandleBarTextContainer>
          </DrawerHandle>

          <DrawerContent>
            <EventList>
              {mapEvents.length > 0 ? (
                mapEvents.map((event) => (
                  <EventItem key={event.id}>
                    <EventTitle>{event.title}</EventTitle>
                    <EventLocation>
                      📍{' '}
                      {event.location.coordinates
                        ? `${event.location.coordinates.lat.toFixed(3)}, ${event.location.coordinates.lng.toFixed(3)}`
                        : '位置未知'}
                    </EventLocation>
                    <EventDate>{event.location.address}</EventDate>
                  </EventItem>
                ))
              ) : (
                <EmptyState>
                  <p>目前沒有符合條件的活動</p>
                </EmptyState>
              )}
            </EventList>
          </DrawerContent>
        </BottomDrawer>
      </MainContainer>
    </PageContainer>
  );
}
