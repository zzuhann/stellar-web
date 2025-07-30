'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signUpSchema, SignUpFormData } from '@/lib/validations';
import { signUp } from '@/lib/auth';
import { useUIStore } from '@/store';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export default function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      const { user, error } = await signUp(data.email, data.password, data.displayName);
      
      if (error) {
        setError('root', { message: error });
        addNotification({
          type: 'error',
          title: '註冊失敗',
          message: error,
        });
      } else if (user) {
        addNotification({
          type: 'success',
          title: '註冊成功',
          message: `歡迎加入，${data.displayName}！`,
        });
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = '註冊時發生未知錯誤';
      setError('root', { message: errorMessage });
      addNotification({
        type: 'error',
        title: '註冊失敗',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">建立帳號</h2>
        <p className="text-gray-600 mt-2">加入我們，開始分享咖啡活動！</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 顯示名稱 */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            顯示名稱
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="請輸入您的顯示名稱"
            {...register('displayName')}
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
          )}
        </div>

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

        {/* 密碼 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密碼
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="請輸入密碼（至少6個字元）"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* 確認密碼 */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            確認密碼
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="請再次輸入密碼"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* 錯誤訊息 */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* 註冊按鈕 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>註冊中...</span>
            </div>
          ) : (
            '建立帳號'
          )}
        </button>

        {/* 其他操作 */}
        {onSwitchToSignIn && (
          <div className="text-center">
            <div className="text-sm text-gray-600">
              已經有帳號了？
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="ml-1 text-amber-600 hover:text-amber-700 font-medium"
              >
                立即登入
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}