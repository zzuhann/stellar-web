'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, UpdateEventData } from '@/lib/api';
import { CoffeeEvent } from '@/types';
import PlaceAutocomplete from './PlaceAutocomplete';
import { firebaseTimestampToDate } from '@/utils';

interface EventEditFormProps {
  event: CoffeeEvent;
  onSuccess?: (updatedEvent: CoffeeEvent) => void;
  onCancel?: () => void;
}

export default function EventEditForm({ event, onSuccess, onCancel }: EventEditFormProps) {
  const queryClient = useQueryClient();

  // 表單狀態
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    address: event.location.address,
    coordinates: event.location.coordinates,
    startDate: firebaseTimestampToDate(event.datetime.start).toISOString().split('T')[0],
    startTime:
      firebaseTimestampToDate(event.datetime.start).toISOString().split('T')[1]?.substring(0, 5) ||
      '10:00',
    endDate: firebaseTimestampToDate(event.datetime.end).toISOString().split('T')[0],
    endTime:
      firebaseTimestampToDate(event.datetime.end).toISOString().split('T')[1]?.substring(0, 5) ||
      '18:00',
    instagram: event.contactInfo?.instagram || '',
    twitter: '',
    threads: '',
    supportProvided: false,
    requiresReservation: false,
    onSiteReservation: false,
    amenities: [] as string[],
    thumbnail: '',
    markerImage: '',
  });

  // 編輯活動 mutation
  const updateEventMutation = useMutation({
    mutationFn: (updateData: UpdateEventData) => eventsApi.update(event.id, updateData),
    onSuccess: (updatedEvent) => {
      // 清除相關的查詢快取
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });

      onSuccess?.(updatedEvent);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateEventData = {
      title: formData.title,
      description: formData.description,
      location: {
        address: formData.address,
        coordinates: formData.coordinates,
      },
      datetime: {
        start: new Date(`${formData.startDate}T${formData.startTime}:00.000Z`).toISOString(),
        end: new Date(`${formData.endDate}T${formData.endTime}:00.000Z`).toISOString(),
      },
      socialMedia: {
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        threads: formData.threads || undefined,
      },
      supportProvided: formData.supportProvided,
      requiresReservation: formData.requiresReservation,
      onSiteReservation: formData.onSiteReservation,
      amenities: formData.amenities,
      thumbnail: formData.thumbnail || undefined,
      markerImage: formData.markerImage || undefined,
    };

    updateEventMutation.mutate(updateData);
  };

  const handleLocationSelect = (place: {
    address: string;
    coordinates: { lat: number; lng: number };
  }) => {
    setFormData((prev) => ({
      ...prev,
      address: place.address,
      coordinates: place.coordinates,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">編輯活動</h2>
        <p className="text-gray-600">
          編輯 <span className="font-medium text-purple-600">{event.artistName}</span> 的應援活動
        </p>
        <p className="text-sm text-gray-500 mt-1">注意：無法修改活動的藝人資訊</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 活動標題 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            活動標題 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            required
            placeholder="例：IU 生日應援咖啡"
          />
        </div>

        {/* 活動描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            活動描述 *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            required
            placeholder="詳細描述活動內容、特色等..."
          />
        </div>

        {/* 地點 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">活動地點 *</label>
          <PlaceAutocomplete
            defaultValue={formData.address}
            onPlaceSelect={handleLocationSelect}
            placeholder="搜尋咖啡廳或活動地點"
          />
        </div>

        {/* 時間設定 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開始時間 *</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">結束時間 *</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* 社群媒體 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">社群媒體連結</h3>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="text"
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="@username 或完整網址"
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
              Twitter / X
            </label>
            <input
              type="text"
              id="twitter"
              value={formData.twitter}
              onChange={(e) => setFormData((prev) => ({ ...prev, twitter: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="@username 或完整網址"
            />
          </div>

          <div>
            <label htmlFor="threads" className="block text-sm font-medium text-gray-700 mb-2">
              Threads
            </label>
            <input
              type="text"
              id="threads"
              value={formData.threads}
              onChange={(e) => setFormData((prev) => ({ ...prev, threads: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="@username 或完整網址"
            />
          </div>
        </div>

        {/* 活動選項 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">活動設定</h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.supportProvided}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supportProvided: e.target.checked }))
                }
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700">提供應援物品</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requiresReservation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, requiresReservation: e.target.checked }))
                }
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700">需要預約</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.onSiteReservation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, onSiteReservation: e.target.checked }))
                }
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700">接受現場候位</span>
            </label>
          </div>
        </div>

        {/* 表單按鈕 */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={updateEventMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateEventMutation.isPending ? '更新中...' : '更新活動'}
          </button>
        </div>

        {/* 錯誤訊息 */}
        {updateEventMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              更新失敗：
              {updateEventMutation.error instanceof Error
                ? updateEventMutation.error.message
                : '未知錯誤'}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
