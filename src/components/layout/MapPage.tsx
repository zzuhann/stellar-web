'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useMapStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { CoffeeEvent } from '@/types';
import MapComponent from '@/components/map/MapContainer';
import EventDetailSidebar from './EventDetailSidebar';
import AuthModal from '@/components/auth/AuthModal';
import { useMapData } from '@/hooks/useMapData';
import { useGeolocation } from '@/hooks/useGeolocation';
import api from '@/lib/api';
import Header from './Header';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  max-width: 120px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  @media (min-width: 768px) {
    font-size: 15px;
    padding: 14px 20px;
    max-width: 140px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  background: #fff;
  border: 1px solid rgba(190, 190, 190);
  border-radius: 0.375rem;
  padding: 1rem 1rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: #333;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: #666;
    font-size: 16px;
  }

  @media (min-width: 768px) {
    font-size: 18px;

    &::placeholder {
      font-size: 18px;
    }
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 1024px) {
    height: 100%;
    min-height: 600px;
    overflow-y: auto;
  }
`;

const ListHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;

    @media (min-width: 768px) {
      font-size: 18px;
    }
  }

  p {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #666;
  }
`;

const EventItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const EventTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
`;

const EventArtist = styled.span`
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const EventLocation = styled.p`
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.3;
`;

const EventDate = styled.p`
  margin: 0;
  font-size: 12px;
  color: #888;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const MapInner = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 8px;
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
  border-radius: 4px;
  background: #fff;
  border: 1px solid #ddd;
  font-size: 14px;
  cursor: ${(props) => (props.loading ? 'not-allowed' : 'pointer')};
  color: #333;

  &:hover {
    background: #f8f9fa;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
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
  border-radius: 16px;
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

const ActionsSection = styled.section`
  /* 移除額外 padding，使用 ContentWrapper 的 gap */
`;

const MobileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;

  @media (min-width: 768px) {
    display: none;
  }
`;

const DesktopActions = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

const ActionButton = styled.button<{ variant?: 'default' | 'purple' | 'amber' }>`
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    padding: 24px;
    min-height: 140px;
  }
`;

const SimpleActionButton = styled.button`
  padding: 14px 32px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  background: #007bff;
  border: 1px solid #007bff;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;

  &:hover {
    background: #0056b3;
    border-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  @media (min-width: 480px) {
    min-width: 250px;
    font-size: 18px;
    padding: 16px 40px;
  }
`;

const ActionContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ActionIcon = styled.div`
  font-size: 36px;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 42px;
    margin-bottom: 12px;
  }
`;

const ActionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const ActionDescription = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  p {
    font-size: 14px;
    color: #666;
    margin: 0;

    @media (min-width: 768px) {
      font-size: 16px;
    }
  }

  button {
    color: #007bff;
    font-weight: 500;
    margin-left: 4px;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
    text-decoration: underline;

    &:hover {
      color: #0056b3;
    }
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #333;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const LoadingSpinnerLarge = styled.div`
  width: 48px;
  height: 48px;
  border: 2px solid transparent;
  border-top: 2px solid #60a5fa;
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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState<CoffeeEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // 地理位置功能
  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
  } = useGeolocation({ autoGetPosition: true });

  // 從 URL 參數初始化篩選狀態
  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    artistId: searchParams?.get('artistId') || '',
    status: 'active' as 'all' | 'active' | 'upcoming' | 'ended',
    region: '',
    page: 1,
    limit: 50,
  });

  // 使用新的 API hooks
  const { data: mapData, isLoading: mapLoading } = useMapData({
    status: filters.status === 'all' ? 'all' : (filters.status as 'active' | 'upcoming'),
    search: filters.search,
    artistId: filters.artistId,
    region: filters.region,
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

  const handleEventSelect = async (event: CoffeeEvent | { id: string }) => {
    // 如果是地圖標記（只有 id），需要載入完整資料
    if (!('title' in event)) {
      try {
        const response = await api.get(`/events/${event.id}`);
        setSelectedEvent(response.data);
      } catch {
        return;
      }
    } else {
      setSelectedEvent(event);
    }
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedEvent(null);
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
          {/* 返回按鈕 */}
          <BackButton onClick={() => router.push('/')}>
            <ArrowLeftIcon />
            返回首頁
          </BackButton>

          {/* 搜尋區域 */}
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="搜尋地點、藝人"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </SearchContainer>

          {/* 地圖和列表區域 */}
          <MapAndListSection>
            {/* 地圖區域 */}
            <MapSection>
              <MapContainer>
                <MapInner>
                  <MapComponent
                    events={mapEvents}
                    onEventSelect={handleEventSelect}
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
                    <EventItem key={event.id} onClick={() => handleEventSelect(event)}>
                      <EventArtist>{event.artistName}</EventArtist>
                      <EventTitle>{event.title}</EventTitle>
                      <EventLocation>
                        📍{' '}
                        {event.coordinates
                          ? `${event.coordinates.lat.toFixed(3)}, ${event.coordinates.lng.toFixed(3)}`
                          : '位置未知'}
                      </EventLocation>
                      <EventDate>
                        {event.status === 'active'
                          ? '🔴 進行中'
                          : event.status === 'upcoming'
                            ? '🟡 即將開始'
                            : '⚪ 其他'}
                      </EventDate>
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

          {/* 手機版：簡單按鈕 / 電腦版：多功能區域 */}
          <ActionsSection>
            {/* 手機版 - 簡單按鈕 */}
            <MobileActions>
              <SimpleActionButton
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                  } else {
                    router.push('/submit-artist');
                  }
                }}
                style={{ background: '#6f42c1', borderColor: '#6f42c1' }}
              >
                投稿藝人
              </SimpleActionButton>

              <SimpleActionButton
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                  } else {
                    router.push('/submit-event');
                  }
                }}
                style={{ background: '#fd7e14', borderColor: '#fd7e14' }}
              >
                投稿活動
              </SimpleActionButton>
            </MobileActions>

            {/* 電腦版 - 功能卡片區 */}
            <DesktopActions>
              {/* 投稿藝人 */}
              <ActionButton
                variant="purple"
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                  } else {
                    router.push('/submit-artist');
                  }
                }}
              >
                <ActionContent>
                  <ActionIcon>⭐</ActionIcon>
                  <ActionTitle>投稿藝人</ActionTitle>
                  <ActionDescription>新增 K-pop 藝人到資料庫</ActionDescription>
                </ActionContent>
              </ActionButton>

              {/* 投稿活動 */}
              <ActionButton
                variant="amber"
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                  } else {
                    router.push('/submit-event');
                  }
                }}
              >
                <ActionContent>
                  <ActionIcon>☕</ActionIcon>
                  <ActionTitle>投稿活動</ActionTitle>
                  <ActionDescription>分享應援咖啡活動資訊</ActionDescription>
                </ActionContent>
              </ActionButton>
            </DesktopActions>

            {/* 未登入提示 */}
            {!user && (
              <LoginPrompt>
                <p>
                  需要登入後才能投稿，
                  <button onClick={() => setAuthModalOpen(true)}>立即登入</button>
                </p>
              </LoginPrompt>
            )}
          </ActionsSection>
        </ContentWrapper>
      </MainContainer>

      {/* 活動詳情側邊欄 */}
      <EventDetailSidebar event={selectedEvent} isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* 認證模態視窗 */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />
    </PageContainer>
  );
}
