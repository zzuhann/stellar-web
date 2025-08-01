'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, UserIcon, PlusIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useArtistStore, useMapStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { CoffeeEvent } from '@/types';
import MapComponent from '@/components/map/MapContainer';
import MapFilters from '@/components/map/MapFilters';
import EventDetailSidebar from './EventDetailSidebar';
import AuthModal from '@/components/auth/AuthModal';
import { useEventFilters } from '@/hooks/useEventFilters';
import { useMapData } from '@/hooks/useMapData';
import { useGeolocation } from '@/hooks/useGeolocation';
import api from '@/lib/api';

export default function MapPage() {
  const { artists, loading: artistsLoading, error: artistsError, fetchArtists } = useArtistStore();
  const { setCenter } = useMapStore();
  const { user, userData, signOut } = useAuth();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<CoffeeEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 地理位置功能
  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
    getCurrentPosition,
  } = useGeolocation({ autoGetPosition: true });

  // 篩選狀態
  const [filters, setFilters] = useState({
    search: '',
    artistId: '',
    status: 'active' as 'all' | 'active' | 'upcoming' | 'ended', // 預設顯示進行中的活動
    region: '',
    page: 1,
    limit: 50,
  });

  // 使用新的 API hooks
  const { data: eventsData, isLoading, error } = useEventFilters(filters);
  const { data: mapData, isLoading: mapLoading } = useMapData({
    status: filters.status === 'all' ? 'all' : (filters.status as 'active' | 'upcoming'),
    search: filters.search,
    artistId: filters.artistId,
    region: filters.region,
  });

  useEffect(() => {
    fetchArtists('approved');
  }, [fetchArtists]);

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
    } else {
      // 如果沒有位置信息，重新獲取
      getCurrentPosition();
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

  if (isLoading || artistsLoading || mapLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入活動資料中...</p>
        </div>
      </div>
    );
  }

  if (error || artistsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">{error?.message || '未知錯誤'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 使用新的資料結構
  const mapEvents = mapData?.events || [];
  const totalEvents = eventsData?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">台灣生咖地圖</h1>
              <span className="text-2xl">☕</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                目前有 <span className="font-semibold text-amber-600">{totalEvents}</span>{' '}
                個符合條件的活動
              </div>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{userData?.displayName || user.email}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user.email}
                      </div>
                      <button
                        onClick={() => {
                          router.push('/my-submissions');
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        我的投稿
                      </button>
                      {userData?.role === 'admin' && (
                        <button
                          onClick={() => {
                            window.open('/admin', '_blank');
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-medium"
                        >
                          ⚖️ 管理員審核
                        </button>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        登出
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  登入
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">探索 K-pop 藝人應援咖啡活動</h2>
          <p className="text-gray-600">地圖上顯示所有進行中的應援咖啡活動，點擊標記查看詳細資訊</p>
        </div>

        {/* 篩選區域 */}
        <MapFilters artists={artists} onFiltersChange={setFilters} />

        {/* 地圖區域 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
          <MapComponent
            events={mapEvents}
            onEventSelect={handleEventSelect}
            userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
          />

          {/* 定位到我的位置按鈕 */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleLocateMe}
              disabled={locationLoading}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-200 ${
                locationLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : latitude && longitude
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              title={
                latitude && longitude
                  ? '重新定位到我的位置'
                  : locationLoading
                    ? '正在獲取位置...'
                    : '定位到我的位置'
              }
            >
              {locationLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <MapPinIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {locationLoading ? '定位中...' : latitude && longitude ? '重新定位' : '我的位置'}
              </span>
            </button>
          </div>

          {/* 地理位置錯誤提示 */}
          {locationError && (
            <div className="absolute top-4 left-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
              <div className="flex items-start space-x-2">
                <div className="text-red-500 text-sm">⚠️</div>
                <div className="text-sm text-red-700">
                  <div className="font-medium">定位失敗</div>
                  <div className="text-xs mt-1">{locationError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 投稿區域 */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">參與社群貢獻</h3>
            <p className="text-gray-600">幫助我們建立更完整的 K-pop 應援活動資料庫</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* 藝人投稿按鈕 */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                } else {
                  router.push('/submit-artist');
                }
              }}
              className="group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center mb-3">
                <UserIcon className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">投稿藝人</h4>
              <p className="text-sm opacity-90">
                新增 K-pop 藝人到資料庫，讓其他用戶可以為他們建立應援活動
              </p>
              <div className="absolute top-2 right-2">
                <PlusIcon className="h-5 w-5 opacity-75 group-hover:opacity-100" />
              </div>
            </button>

            {/* 活動投稿按鈕 */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                } else {
                  router.push('/submit-event');
                }
              }}
              className="group relative bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center mb-3">
                <span className="text-2xl">☕</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">投稿活動</h4>
              <p className="text-sm opacity-90">分享您發現的應援咖啡活動，讓更多粉絲一起參與</p>
              <div className="absolute top-2 right-2">
                <PlusIcon className="h-5 w-5 opacity-75 group-hover:opacity-100" />
              </div>
            </button>
          </div>

          {!user && (
            <p className="text-center text-sm text-gray-500 mt-4">
              需要登入後才能投稿，
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                立即登入
              </button>
            </p>
          )}
        </div>

        {/* 活動統計 */}
        {totalEvents > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-amber-600">{totalEvents}</div>
              <div className="text-sm text-gray-600">符合條件活動</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{artists.length}</div>
              <div className="text-sm text-gray-600">應援藝人</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{mapData?.total || 0}</div>
              <div className="text-sm text-gray-600">地圖顯示</div>
            </div>
          </div>
        )}

        {/* 空狀態 */}
        {totalEvents === 0 && !isLoading && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">沒有符合條件的活動</h3>
            <p className="text-gray-600 mb-4">請調整篩選條件，或者</p>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  artistId: '',
                  status: 'active',
                  region: '',
                  page: 1,
                  limit: 50,
                })
              }
              className="bg-amber-600 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-700 transition-colors"
            >
              清除所有篩選
            </button>
          </div>
        )}
      </main>

      {/* 活動詳情側邊欄 */}
      <EventDetailSidebar event={selectedEvent} isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* 認證模態視窗 */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}
