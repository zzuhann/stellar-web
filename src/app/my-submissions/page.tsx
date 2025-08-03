'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { CoffeeEvent } from '@/types';
import EventSubmissionForm from '@/components/forms/EventSubmissionForm';
import { showToast } from '@/lib/toast';
import { firebaseTimestampToDate } from '@/utils';

export default function MySubmissionsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('artists');
  const [editingEvent, setEditingEvent] = useState<CoffeeEvent | null>(null);
  const queryClient = useQueryClient();

  // 使用新的 /me API 取得用戶投稿
  const { data: userSubmissions, isLoading: loading } = useQuery({
    queryKey: ['user-submissions'],
    queryFn: eventsApi.getMySubmissions,
    enabled: !!user,
  });

  // 刪除活動 mutation
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('活動刪除成功');
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '刪除活動時發生錯誤');
    },
  });

  // 權限檢查
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看投稿狀態');
      router.push('/');
    }
  }, [user, authLoading, router]);

  // 從 API 取得的資料
  const userArtists = useMemo(() => userSubmissions?.artists || [], [userSubmissions?.artists]);
  const userEvents = useMemo(() => userSubmissions?.events || [], [userSubmissions?.events]);

  // 處理編輯活動
  const handleEditEvent = useCallback((event: CoffeeEvent) => {
    setEditingEvent(event);
  }, []);

  // 處理刪除活動
  const handleDeleteEvent = useCallback(
    (event: CoffeeEvent) => {
      if (window.confirm(`確定要刪除活動「${event.title}」嗎？此操作無法復原。`)) {
        deleteEventMutation.mutate(event.id);
      }
    },
    [deleteEventMutation]
  );

  // 編輯成功後的處理
  const handleEditSuccess = useCallback(() => {
    setEditingEvent(null);
    queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
    showToast.success('活動資訊更新成功');
  }, [queryClient]);

  const getStatusBadge = useCallback((status: 'pending' | 'approved' | 'rejected') => {
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
  }, []);

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
                <p className="text-sm text-gray-500">共 {userArtists.length} 位藝人投稿</p>
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
                            <p className="text-xs text-green-600 mt-1">
                              ✨ 其他用戶現在可以選擇這位藝人了
                            </p>
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
        {activeTab === 'events' && userSubmissions && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">我投稿的活動</h2>
                <p className="text-sm text-gray-500">共 {userEvents.length} 個活動投稿</p>
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
                          <div className="flex items-start space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                            <div className="flex flex-wrap gap-1">
                              {event.artists.map((artist) => (
                                <span
                                  key={artist.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {artist.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
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
                              {event.location.name && `${event.location.name} - `}
                              {event.location.address}
                            </div>
                          </div>

                          <p className="text-xs text-gray-400">
                            投稿時間：
                            {firebaseTimestampToDate(event.createdAt).toLocaleString('zh-TW')}
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

                          {/* 操作按鈕 */}
                          <div className="flex justify-end space-x-2 mt-3">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              title="編輯活動"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              編輯
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              disabled={deleteEventMutation.isPending}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="刪除活動"
                            >
                              <TrashIcon className="h-3 w-3 mr-1" />
                              {deleteEventMutation.isPending ? '刪除中...' : '刪除'}
                            </button>
                          </div>
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
        {userSubmissions &&
          (userSubmissions.summary.totalArtists > 0 || userSubmissions.summary.totalEvents > 0) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {userSubmissions.summary.totalArtists + userSubmissions.summary.totalEvents}
                </div>
                <div className="text-sm text-gray-600">總投稿數</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userSubmissions.summary.approvedArtists + userSubmissions.summary.approvedEvents}
                </div>
                <div className="text-sm text-gray-600">已通過</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {userSubmissions.summary.pendingArtists + userSubmissions.summary.pendingEvents}
                </div>
                <div className="text-sm text-gray-600">審核中</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {userSubmissions.summary.totalArtists -
                    userSubmissions.summary.approvedArtists -
                    userSubmissions.summary.pendingArtists +
                    (userSubmissions.summary.totalEvents -
                      userSubmissions.summary.approvedEvents -
                      userSubmissions.summary.pendingEvents)}
                </div>
                <div className="text-sm text-gray-600">已拒絕</div>
              </div>
            </div>
          )}
      </div>

      {/* 編輯活動模態框 */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EventSubmissionForm
              mode="edit"
              existingEvent={editingEvent}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingEvent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
