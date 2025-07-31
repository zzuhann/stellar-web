'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPinIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { useEventStore, useArtistStore, useUIStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import PlaceAutocomplete from './PlaceAutocomplete';

interface EventSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventSubmissionForm({ onSuccess, onCancel }: EventSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { createEvent } = useEventStore();
  const { artists } = useArtistStore();
  const { addNotification } = useUIStore();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventSubmissionFormData>({
    resolver: zodResolver(eventSubmissionSchema),
  });

  // 監聽開始日期變化，自動設定結束日期最小值
  const startDate = watch('startDate');

  // 處理地點選擇
  const handlePlaceSelect = useCallback(
    (place: { address: string; coordinates: { lat: number; lng: number } }) => {
      setValue('address', place.address, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setLocationCoordinates(place.coordinates);
    },
    [setValue]
  );

  const onSubmit = async (data: EventSubmissionFormData) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: '請先登入',
        message: '您需要登入後才能投稿活動',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 檢查是否能取得 token
      const _token = await user.getIdToken();
      // 找到選中的藝人
      const selectedArtist = artists.find((artist) => artist.stageName === data.artistName);

      // 準備活動資料
      const eventData = {
        title: data.title,
        artistId: selectedArtist?.id || '',
        artistName: data.artistName,
        description: data.description || '',
        datetime: {
          start: {
            _seconds: Math.floor(new Date(data.startDate).getTime() / 1000),
            _nanoseconds: 0,
          },
          end: {
            _seconds: Math.floor(new Date(data.endDate).getTime() / 1000),
            _nanoseconds: 0,
          },
        },
        location: {
          address: data.address,
          coordinates: locationCoordinates || {
            // 如果沒有座標，使用台北市中心座標
            lat: 25.033,
            lng: 121.5654,
          },
        },
        contactInfo: {
          phone: data.phone || undefined,
          instagram: data.instagram || undefined,
          facebook: data.facebook || undefined,
        },
        images: [], // 暫時不支援圖片上傳
        isDeleted: false,
      };

      await createEvent(eventData);

      addNotification({
        type: 'success',
        title: '投稿成功',
        message: '您的活動已送出審核，審核通過後將會出現在地圖上',
      });

      onSuccess?.();
    } catch {
      addNotification({
        type: 'error',
        title: '投稿失敗',
        message: '投稿時發生錯誤，請稍後再試',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">投稿活動</h2>
        <p className="text-gray-600 mt-2">分享 K-pop 藝人應援咖啡活動資訊</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 活動標題 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            活動標題 *
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例：IU 生日應援咖啡活動"
            {...register('title')}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* 應援藝人 */}
        <div>
          <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-1">
            <UserIcon className="inline h-4 w-4 mr-1" />
            應援藝人 *
          </label>
          <select
            id="artistName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            {...register('artistName')}
          >
            <option value="">請選擇藝人</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.stageName}>
                {artist.stageName}
                {artist.realName && ` (${artist.realName})`}
              </option>
            ))}
          </select>
          {errors.artistName && (
            <p className="mt-1 text-sm text-red-600">{errors.artistName.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">找不到想要的藝人？可以聯絡管理員新增</p>
        </div>

        {/* 活動描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            活動描述
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="描述活動內容、特色、提供的飲品或周邊等..."
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* 活動時間 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              開始日期 *
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              結束日期 *
            </label>
            <input
              id="endDate"
              type="date"
              min={startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* 活動地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPinIcon className="inline h-4 w-4 mr-1" />
            活動地址 *
          </label>
          <PlaceAutocomplete
            onPlaceSelect={handlePlaceSelect}
            placeholder="搜尋活動地點名稱或地址"
          />
          <input type="hidden" {...register('address')} />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          <p className="mt-1 text-xs text-gray-500">請從搜尋結果中選擇地點，以確保地址正確</p>
        </div>

        {/* 聯絡資訊 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">聯絡資訊</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                <PhoneIcon className="inline h-4 w-4 mr-1" />
                電話號碼
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="09xxxxxxxx"
                {...register('phone')}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                id="instagram"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="@username"
                {...register('instagram')}
              />
              {errors.instagram && (
                <p className="mt-1 text-sm text-red-600">{errors.instagram.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
              Facebook 連結
            </label>
            <input
              id="facebook"
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://facebook.com/..."
              {...register('facebook')}
            />
            {errors.facebook && (
              <p className="mt-1 text-sm text-red-600">{errors.facebook.message}</p>
            )}
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>投稿中...</span>
              </div>
            ) : (
              '提交投稿'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
