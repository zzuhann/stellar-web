'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useEventStore, useArtistStore, useUIStore } from '@/store';
import { firebaseTimestampToDate } from '@/utils';

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { addNotification } = useUIStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('artists');
  const [loading, setLoading] = useState(false);

  // 狀態管理
  const { artists: pendingArtists, fetchArtists, approveArtist, rejectArtist } = useArtistStore();
  const { events: pendingEvents, fetchEvents, admin } = useEventStore();

  // 權限檢查
  useEffect(() => {
    if (!authLoading && (!user || userData?.role !== 'admin')) {
      addNotification({
        type: 'error',
        title: '權限不足',
        message: '您沒有管理員權限',
      });
      router.push('/');
    }
  }, [user, userData, authLoading, router, addNotification]);

  // 載入資料
  useEffect(() => {
    if (user && userData?.role === 'admin') {
      fetchArtists({ status: 'pending' });
      fetchEvents({ status: 'pending' });
    }
  }, [user, userData, fetchArtists, fetchEvents]);

  const handleApproveArtist = async (artistId: string) => {
    setLoading(true);
    try {
      await approveArtist(artistId);
      addNotification({
        type: 'success',
        title: '審核成功',
        message: '藝人已通過審核',
      });
    } catch {
      addNotification({
        type: 'error',
        title: '審核失敗',
        message: '操作時發生錯誤',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectArtist = async (artistId: string) => {
    setLoading(true);
    try {
      await rejectArtist(artistId);
      addNotification({
        type: 'success',
        title: '已拒絕',
        message: '藝人審核已拒絕',
      });
    } catch {
      addNotification({
        type: 'error',
        title: '操作失敗',
        message: '操作時發生錯誤',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    setLoading(true);
    try {
      await admin.approveEvent(eventId);
      addNotification({
        type: 'success',
        title: '審核成功',
        message: '活動已通過審核並會出現在地圖上',
      });
    } catch {
      addNotification({
        type: 'error',
        title: '審核失敗',
        message: '操作時發生錯誤',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    setLoading(true);
    try {
      await admin.rejectEvent(eventId);
      addNotification({
        type: 'success',
        title: '已拒絕',
        message: '活動審核已拒絕',
      });
    } catch {
      addNotification({
        type: 'error',
        title: '操作失敗',
        message: '操作時發生錯誤',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">管理員審核中心</h1>
              <span className="ml-2 text-2xl">⚖️</span>
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
              待審藝人
              {pendingArtists.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingArtists.length}
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
              待審活動
              {pendingEvents.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingEvents.length}
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
                <h2 className="text-lg font-medium text-gray-900">待審核藝人</h2>
                <p className="text-sm text-gray-500">{pendingArtists.length} 位藝人等待審核</p>
              </div>
              {pendingArtists.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">沒有待審核藝人</h3>
                  <p className="mt-1 text-sm text-gray-500">所有藝人投稿都已處理完成</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingArtists.map((artist) => (
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveArtist(artist.id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            通過
                          </button>
                          <button
                            onClick={() => handleRejectArtist(artist.id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            拒絕
                          </button>
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
                <h2 className="text-lg font-medium text-gray-900">待審核活動</h2>
                <p className="text-sm text-gray-500">{pendingEvents.length} 個活動等待審核</p>
              </div>
              {pendingEvents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">沒有待審核活動</h3>
                  <p className="mt-1 text-sm text-gray-500">所有活動投稿都已處理完成</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {event.artists.map((artist) => artist.name).join(', ')}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {firebaseTimestampToDate(event.datetime.start).toLocaleDateString(
                                'zh-TW'
                              )}{' '}
                              -{' '}
                              {firebaseTimestampToDate(event.datetime.end).toLocaleDateString(
                                'zh-TW'
                              )}
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {event.location.address}
                            </div>
                          </div>

                          {(event.socialMedia?.instagram ||
                            event.socialMedia?.x ||
                            event.socialMedia?.threads) && (
                            <div className="mt-2 text-sm text-gray-500">
                              聯絡資訊：
                              {event.socialMedia.instagram && ` IG：${event.socialMedia.instagram}`}
                              {event.socialMedia.x && ` X：${event.socialMedia.x}`}
                              {event.socialMedia.threads &&
                                ` Threads：${event.socialMedia.threads}`}
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-2">
                            投稿時間：
                            {firebaseTimestampToDate(event.createdAt).toLocaleString('zh-TW')}
                          </p>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveEvent(event.id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            通過
                          </button>
                          <button
                            onClick={() => handleRejectEvent(event.id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            拒絕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
