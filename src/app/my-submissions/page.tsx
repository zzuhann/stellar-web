'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { UserIcon, CalendarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ClockIcon as PendingIcon } from '@heroicons/react/24/outline';
import { useEventStore, useArtistStore, useUIStore } from '@/store';
import { Artist, CoffeeEvent } from '@/types';

export default function MySubmissionsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { addNotification } = useUIStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('artists');
  const [loading, setLoading] = useState(false);

  // 狀態管理
  const { artists, fetchArtists } = useArtistStore();
  const { events, fetchEvents } = useEventStore();

  // 權限檢查
  useEffect(() => {
    if (!authLoading && !user) {
      addNotification({
        type: 'error',
        title: '請先登入',
        message: '您需要登入後才能查看投稿狀態',
      });
      router.push('/');
    }
  }, [user, authLoading, router, addNotification]);

  // 載入用戶的投稿資料
  useEffect(() => {
    if (user) {
      loadUserSubmissions();
    }
  }, [user]);

  const loadUserSubmissions = async () => {
    setLoading(true);
    try {
      // 載入所有藝人和活動，然後篩選出用戶的投稿
      await Promise.all([
        fetchArtists(), // 載入所有藝人
        fetchEvents()   // 載入所有活動
      ]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: '載入失敗',
        message: '無法載入投稿資料',
      });
    } finally {
      setLoading(false);
    }
  };

  // 篩選用戶的投稿（前端篩選，後續可考慮讓後端處理）
  const userArtists = artists.filter(artist => artist.createdBy === user?.uid);
  const userEvents = events.filter(event => event.createdBy === user?.uid);

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            已通過
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            已拒絕
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <PendingIcon className="h-3 w-3 mr-1" />
            審核中
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入投稿資料中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">我的投稿</h1>
              <span className="ml-2 text-2xl">📝</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              返回首頁
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {userData?.displayName || user.email}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('artists')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'artists'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              我的藝人投稿
              {userArtists.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {userArtists.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              我的活動投稿
              {userEvents.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {userEvents.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">我投稿的藝人</h2>
                <p className="text-sm text-gray-500">
                  共 {userArtists.length} 位藝人投稿
                </p>
              </div>
              
              {userArtists.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">還沒有藝人投稿</h3>
                  <p className="mt-1 text-sm text-gray-500">開始投稿您喜愛的 K-pop 藝人吧！</p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                    >
                      前往投稿
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {userArtists.map((artist) => (
                    <div key={artist.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {artist.profileImage ? (
                            <img
                              src={artist.profileImage}
                              alt={artist.stageName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {artist.stageName}
                            </h3>
                            {artist.realName && (
                              <p className="text-sm text-gray-500">{artist.realName}</p>
                            )}
                            {artist.birthday && (
                              <p className="text-sm text-gray-500">
                                生日：{new Date(artist.birthday).toLocaleDateString('zh-TW')}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              投稿時間：{new Date(artist.createdAt).toLocaleString('zh-TW')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {getStatusBadge(artist.status)}
                          {artist.status === 'approved' && (
                            <p className="text-xs text-green-600 mt-1">✨ 其他用戶現在可以選擇這位藝人了</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">我投稿的活動</h2>
                <p className="text-sm text-gray-500">
                  共 {userEvents.length} 個活動投稿
                </p>
              </div>
              
              {userEvents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">還沒有活動投稿</h3>
                  <p className="mt-1 text-sm text-gray-500">分享您發現的應援咖啡活動吧！</p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                    >
                      前往投稿
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {userEvents.map((event) => (
                    <div key={event.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {event.title}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {event.artistName}
                            </span>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {new Date(event.startDate).toLocaleDateString('zh-TW')} - {new Date(event.endDate).toLocaleDateString('zh-TW')}
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {event.location.address}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-400">
                            投稿時間：{new Date(event.createdAt).toLocaleString('zh-TW')}
                          </p>
                        </div>
                        
                        <div className="text-right ml-4">
                          {getStatusBadge(event.status)}
                          {event.status === 'approved' && (
                            <p className="text-xs text-green-600 mt-1">🗺️ 活動已顯示在地圖上</p>
                          )}
                          {event.status === 'pending' && (
                            <p className="text-xs text-yellow-600 mt-1">⏳ 等待管理員審核</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {(userArtists.length > 0 || userEvents.length > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {userArtists.length + userEvents.length}
              </div>
              <div className="text-sm text-gray-600">總投稿數</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {[...userArtists, ...userEvents].filter(item => item.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">已通過</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {[...userArtists, ...userEvents].filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">審核中</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {[...userArtists, ...userEvents].filter(item => item.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">已拒絕</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}