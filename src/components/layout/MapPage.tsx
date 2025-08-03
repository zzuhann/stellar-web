'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useMapStore } from '@/store';
import MapComponent from '@/components/map/MapContainer';
import { useMapData } from '@/hooks/useMapData';
import { useGeolocation } from '@/hooks/useGeolocation';
import Header from './Header';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  padding-top: 100px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 16px 40px;

  @media (min-width: 768px) {
    padding: 100px 24px 60px;
  }

  @media (min-width: 1024px) {
    padding: 100px 32px 80px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    gap: 32px;
  }

  @media (min-width: 1024px) {
    gap: 40px;
  }
`;

const MapAndListSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 32px;
    min-height: 600px;
  }
`;

const MapSection = styled.div`
  @media (min-width: 1024px) {
    flex: 1;
    min-width: 0; /* 防止 flex item 溢出 */
  }
`;

const MapContainer = styled.div`
  height: 300px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);

  @media (min-width: 480px) {
    height: 350px;
  }

  @media (min-width: 768px) {
    height: 450px;
  }

  @media (min-width: 1024px) {
    height: 100%;
    min-height: 600px;
  }
`;

const ListSection = styled.div`
  @media (min-width: 1024px) {
    flex: 0 0 400px; /* 固定寬度 400px */
    display: flex;
    flex-direction: column;
  }
`;

const EventList = styled.div`
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  @media (min-width: 1024px) {
    height: 100%;
    min-height: 600px;
    overflow-y: auto;
  }
`;

const ListHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);

    @media (min-width: 768px) {
      font-size: 18px;
    }
  }

  p {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
`;

const EventItem = styled.div`
  padding: 16px 20px;
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

const MapInner = styled.div`
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const LocationButton = styled.button<{ loading?: boolean; hasLocation?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  font-size: 14px;
  cursor: ${(props) => (props.loading ? 'not-allowed' : 'pointer')};
  color: var(--color-text-primary);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-medium);
  }

  &:disabled {
    opacity: 0.6;
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

export default function MapPageStyled() {
  const { setCenter } = useMapStore();
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

  // 使用新的 API hooks
  const { data: mapData, isLoading: mapLoading } = useMapData({
    status: 'all',
    search,
    artistId,
  });

  // 標記是否應該自動定位到用戶位置
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);

  // 當獲取到用戶位置時，自動更新地圖中心（僅第一次）
  useEffect(() => {
    if (latitude && longitude && setCenter && shouldAutoCenter) {
      setCenter({ lat: latitude, lng: longitude, zoom: 8 });
      setShouldAutoCenter(false); // 只自動定位一次
    }
  }, [latitude, longitude, setCenter, shouldAutoCenter]);

  // 處理定位到我的位置
  const handleLocateMe = () => {
    if (latitude && longitude) {
      // 強制設置地圖中心到用戶位置
      // 添加一個小的隨機偏移來確保 center 值發生變化
      const randomOffset = 0.0001 * Math.random();
      setCenter({
        lat: latitude + randomOffset,
        lng: longitude + randomOffset,
        zoom: 12,
      });

      // 立即設置回準確位置
      setTimeout(() => {
        setCenter({ lat: latitude, lng: longitude, zoom: 12 });
      }, 100);
    }
  };

  if (mapLoading) {
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
        <ContentWrapper>
          {/* 地圖和列表區域 */}
          <MapAndListSection>
            {/* 地圖區域 */}
            <MapSection>
              <MapContainer>
                <MapInner>
                  <MapComponent
                    events={mapEvents}
                    userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
                  />
                </MapInner>

                <LocationButton
                  onClick={handleLocateMe}
                  disabled={locationLoading}
                  loading={locationLoading}
                  hasLocation={!!(latitude && longitude)}
                >
                  {locationLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <MapPinIcon style={{ width: '16px', height: '16px' }} />
                  )}
                  <span>
                    {locationLoading
                      ? '定位中...'
                      : latitude && longitude
                        ? '重新定位'
                        : '我的位置'}
                  </span>
                </LocationButton>

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

            {/* 列表區域 */}
            <ListSection>
              <EventList>
                <ListHeader>
                  <h3>活動列表</h3>
                  <p>共 {mapEvents.length} 個活動</p>
                </ListHeader>

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
            </ListSection>
          </MapAndListSection>
        </ContentWrapper>
      </MainContainer>
    </PageContainer>
  );
}
