'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEventStore, useUIStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { CoffeeEvent } from '@/types';
import MapComponent from '@/components/map/MapContainer';
import EventDetailSidebar from './EventDetailSidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function MapPage() {
  const { events, loading, error, fetchEvents } = useEventStore();
  const { openModal } = useUIStore();
  const { user, userData, loading: authLoading, signOut } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<CoffeeEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventSelect = (event: CoffeeEvent) => {
    setSelectedEvent(event);
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入活動資料中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchEvents()}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 篩選未結束的活動
  const activeEvents = events.filter(event => {
    const now = new Date();
    const endDate = new Date(event.endDate);
    return endDate >= now;
  });

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
                目前有 <span className="font-semibold text-amber-600">{activeEvents.length}</span> 個進行中活動
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
                          openModal('eventSubmission');
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        投稿活動
                      </button>
                      <button
                        onClick={() => {
                          // TODO: 實作我的投稿頁面
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        我的投稿
                      </button>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            探索 K-pop 藝人應援咖啡活動
          </h2>
          <p className="text-gray-600">
            地圖上顯示所有進行中的應援咖啡活動，點擊標記查看詳細資訊
          </p>
        </div>

        {/* 地圖區域 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MapComponent 
            events={events} 
            onEventSelect={handleEventSelect}
          />
        </div>

        {/* 活動統計 */}
        {activeEvents.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-amber-600">{activeEvents.length}</div>
              <div className="text-sm text-gray-600">進行中活動</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(activeEvents.map(e => e.artistName)).size}
              </div>
              <div className="text-sm text-gray-600">應援藝人</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(activeEvents.map(e => e.location.address.split(' ')[0])).size}
              </div>
              <div className="text-sm text-gray-600">涵蓋縣市</div>
            </div>
          </div>
        )}

        {/* 空狀態 */}
        {activeEvents.length === 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              目前沒有進行中的活動
            </h3>
            <p className="text-gray-600 mb-4">
              請稍後再回來查看，或者
            </p>
            <button className="bg-amber-600 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-700 transition-colors">
              投稿新活動
            </button>
          </div>
        )}
      </main>

      {/* 活動詳情側邊欄 */}
      <EventDetailSidebar
        event={selectedEvent}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      {/* 認證模態視窗 */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}