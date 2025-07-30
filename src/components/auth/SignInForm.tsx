'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signInSchema, SignInFormData } from '@/lib/validations';
import { signIn } from '@/lib/auth';
import { useUIStore } from '@/store';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToReset?: () => void;
}

export default function SignInForm({ 
  onSuccess, 
  onSwitchToSignUp, 
  onSwitchToReset 
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      const { user, error } = await signIn(data.email, data.password);
      
      if (error) {
        setError('root', { message: error });
        addNotification({
          type: 'error',
          title: '登入失敗',
          message: error,
        });
      } else if (user) {
        addNotification({
          type: 'success',
          title: '登入成功',
          message: `歡迎回來，${user.displayName || user.email}！`,
        });
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = '登入時發生未知錯誤';
      setError('root', { message: errorMessage });
      addNotification({
        type: 'error',
        title: '登入失敗',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">登入帳號</h2>
        <p className="text-gray-600 mt-2">歡迎回來！請登入您的帳號</p>
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

        {/* 密碼 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密碼
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="請輸入您的密碼"
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

        {/* 錯誤訊息 */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* 登入按鈕 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>登入中...</span>
            </div>
          ) : (
            '登入'
          )}
        </button>

        {/* 其他操作 */}
        <div className="text-center space-y-2">
          {onSwitchToReset && (
            <button
              type="button"
              onClick={onSwitchToReset}
              className="text-sm text-amber-600 hover:text-amber-700 underline"
            >
              忘記密碼？
            </button>
          )}

          {onSwitchToSignUp && (
            <div className="text-sm text-gray-600">
              還沒有帳號？
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="ml-1 text-amber-600 hover:text-amber-700 font-medium"
              >
                立即註冊
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}