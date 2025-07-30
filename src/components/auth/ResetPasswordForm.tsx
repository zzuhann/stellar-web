'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations';
import { resetPassword } from '@/lib/auth';
import { useUIStore } from '@/store';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export default function ResetPasswordForm({ 
  onSuccess, 
  onSwitchToSignIn 
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { addNotification } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        setError('root', { message: error });
        addNotification({
          type: 'error',
          title: '重設密碼失敗',
          message: error,
        });
      } else {
        setIsEmailSent(true);
        addNotification({
          type: 'success',
          title: '重設密碼郵件已發送',
          message: `請檢查您的信箱 ${data.email}`,
        });
      }
    } catch (error) {
      const errorMessage = '發送重設密碼郵件時發生未知錯誤';
      setError('root', { message: errorMessage });
      addNotification({
        type: 'error',
        title: '重設密碼失敗',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    onSuccess?.();
    onSwitchToSignIn?.();
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">郵件已發送</h2>
          <p className="text-gray-600 mt-2">
            我們已經發送重設密碼的郵件到
          </p>
          <p className="font-medium text-amber-600">{getValues('email')}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">請按照以下步驟完成密碼重設：</p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>檢查您的電子郵件信箱</li>
              <li>點擊郵件中的重設密碼連結</li>
              <li>設定新的密碼</li>
              <li>使用新密碼登入</li>
            </ol>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBackToSignIn}
          className="w-full bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
        >
          返回登入
        </button>

        <div className="mt-4 text-sm text-gray-600">
          沒有收到郵件？檢查垃圾郵件資料夾或
          <button
            type="button"
            onClick={() => setIsEmailSent(false)}
            className="ml-1 text-amber-600 hover:text-amber-700 font-medium"
          >
            重新發送
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">重設密碼</h2>
        <p className="text-gray-600 mt-2">
          請輸入您的電子郵件地址，我們將發送重設密碼的連結給您
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 電子郵件 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            電子郵件
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="請輸入您的電子郵件"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* 錯誤訊息 */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* 發送重設郵件按鈕 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>發送中...</span>
            </div>
          ) : (
            '發送重設郵件'
          )}
        </button>

        {/* 返回登入 */}
        {onSwitchToSignIn && (
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              返回登入
            </button>
          </div>
        )}
      </form>
    </div>
  );
}