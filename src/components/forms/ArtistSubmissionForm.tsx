'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import * as z from 'zod';
import { useArtistStore, useUIStore } from '@/store';
import { useAuth } from '@/lib/auth-context';

// 藝人投稿表單驗證
const artistSubmissionSchema = z.object({
  stageName: z
    .string()
    .min(1, '請輸入藝名')
    .min(2, '藝名至少需要2個字元')
    .max(50, '藝名不能超過50個字元'),
  realName: z
    .string()
    .max(50, '本名不能超過50個字元')
    .optional()
    .or(z.literal('')),
  birthday: z
    .string()
    .optional()
    .or(z.literal('')),
  profileImage: z
    .string()
    .url('請輸入正確的圖片連結格式')
    .optional()
    .or(z.literal('')),
});

type ArtistSubmissionFormData = z.infer<typeof artistSubmissionSchema>;

interface ArtistSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ArtistSubmissionForm({ onSuccess, onCancel }: ArtistSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createArtist } = useArtistStore();
  const { addNotification } = useUIStore();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ArtistSubmissionFormData>({
    resolver: zodResolver(artistSubmissionSchema),
  });

  const onSubmit = async (data: ArtistSubmissionFormData) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: '請先登入',
        message: '您需要登入後才能投稿藝人',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 準備藝人資料
      const artistData = {
        stageName: data.stageName,
        realName: data.realName || undefined,
        birthday: data.birthday || undefined,
        profileImage: data.profileImage || undefined,
      };

      await createArtist(artistData);

      addNotification({
        type: 'success',
        title: '藝人投稿成功',
        message: '您投稿的藝人已送出審核，審核通過後其他用戶就可以選擇了',
      });

      reset();
      onSuccess?.();
    } catch (error) {
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
        <h2 className="text-2xl font-bold text-gray-900">投稿藝人</h2>
        <p className="text-gray-600 mt-2">新增 K-pop 藝人到我們的資料庫</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 藝名 */}
        <div>
          <label htmlFor="stageName" className="block text-sm font-medium text-gray-700 mb-1">
            <UserIcon className="inline h-4 w-4 mr-1" />
            藝名 / 團體名稱 *
          </label>
          <input
            id="stageName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例：IU、BTS、BLACKPINK"
            {...register('stageName')}
          />
          {errors.stageName && (
            <p className="mt-1 text-sm text-red-600">{errors.stageName.message}</p>
          )}
        </div>

        {/* 本名 */}
        <div>
          <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-1">
            本名 / 韓文名稱
          </label>
          <input
            id="realName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例：이지은 (李知恩)、방탄소년단"
            {...register('realName')}
          />
          {errors.realName && (
            <p className="mt-1 text-sm text-red-600">{errors.realName.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">可選填，有助於其他用戶識別</p>
        </div>

        {/* 生日 */}
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
            <CalendarIcon className="inline h-4 w-4 mr-1" />
            生日 / 出道日期
          </label>
          <input
            id="birthday"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            {...register('birthday')}
          />
          {errors.birthday && (
            <p className="mt-1 text-sm text-red-600">{errors.birthday.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            個人藝人填生日，團體可填出道日期
          </p>
        </div>

        {/* 個人照片/團體照 */}
        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
            <PhotoIcon className="inline h-4 w-4 mr-1" />
            個人照片 / 團體照連結
          </label>
          <input
            id="profileImage"
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="https://example.com/image.jpg"
            {...register('profileImage')}
          />
          {errors.profileImage && (
            <p className="mt-1 text-sm text-red-600">{errors.profileImage.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            可選填，請提供公開的圖片連結
          </p>
        </div>

        {/* 說明區塊 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">投稿說明：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>投稿的藝人將經過管理員審核</li>
              <li>審核通過後，所有用戶都可以選擇這位藝人來投稿活動</li>
              <li>請確保藝人資訊的正確性</li>
              <li>重複的藝人投稿將被拒絕</li>
            </ul>
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