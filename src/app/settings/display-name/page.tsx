'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { css } from '@/styled-system/css';
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Loading from '@/components/Loading';

const displayNameSchema = z.object({
  displayName: z
    .string()
    .min(1, '名稱不能為空')
    .max(50, '名稱不能超過 50 個字元')
    .regex(
      /^[a-zA-Z0-9\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\s]+$/,
      '名稱只能包含中文、日文、英文、數字和空格'
    ),
});

type DisplayNameFormData = z.infer<typeof displayNameSchema>;

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '600px',
  margin: '0 auto',
  padding: '100px 16px 40px',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

const contentWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const pageHeader = css({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '8px',
  '& h1': {
    fontSize: '28px',
    fontWeight: 700,
    color: 'color.text.primary',
    margin: '0',
  },
});

const backButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: 'radius.md',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.tertiary',
    borderColor: 'color.border.medium',
  },
  '& svg': {
    width: '20px',
    height: '20px',
    color: 'color.text.primary',
  },
});

const settingsCard = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  boxShadow: 'shadow.sm',
});

const formContainer = css({
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const formGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const label = css({
  fontSize: '14px',
  fontWeight: 600,
  color: 'color.text.primary',
});

const input = css({
  width: '100%',
  padding: '12px 16px',
  border: '2px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  fontSize: '16px',
  transition: 'all 0.2s ease',
  background: 'white',
  color: 'color.text.primary',
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
});

const inputError = css({
  borderColor: '#ef4444',
  '&:focus': {
    borderColor: '#ef4444',
  },
});

const errorText = css({
  fontSize: '12px',
  color: '#ef4444',
  marginTop: '4px',
});

const buttonGroup = css({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '8px',
});

const button = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  borderRadius: 'radius.md',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  '& svg': {
    width: '16px',
    height: '16px',
  },
});

const buttonPrimary = css({
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#3a5d7a',
    borderColor: '#3a5d7a',
  },
});

const buttonSecondary = css({
  background: 'color.background.primary',
  borderColor: 'color.border.light',
  color: 'color.text.primary',
  '&:hover:not(:disabled)': {
    background: 'color.background.secondary',
    borderColor: 'color.border.medium',
  },
});

const loadingSpinner = css({
  width: '16px',
  height: '16px',
  border: '2px solid transparent',
  borderTop: '2px solid currentColor',
  borderTopColor: 'currentColor',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
});

export default function DisplayNamePage() {
  const { user, userData, loading: authLoading, refetchUserData } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    formState: { errors },
    setValue,
    reset,
    getValues,
    watch,
  } = useForm<DisplayNameFormData>({
    resolver: zodResolver(displayNameSchema),
  });

  const currentDisplayName = watch('displayName');
  const hasChanges = currentDisplayName !== userData?.displayName;

  // 更新用戶資料的 mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: DisplayNameFormData) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      showToast.success('顯示名稱更新成功');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      // 重置表單為新的值
      reset({ displayName: updatedUser.displayName });
      refetchUserData();
      // 返回設定頁面
      router.push('/settings');
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '更新顯示名稱時發生錯誤');
    },
  });

  // 權限檢查和初始化
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能修改顯示名稱');
      router.push('/');
    }
  }, [user, authLoading, router]);

  // 設置初始值
  useEffect(() => {
    if (userData?.displayName) {
      setValue('displayName', userData.displayName);
    }
  }, [userData, setValue]);

  const handleSave = () => {
    const values = getValues();
    if (errors.displayName) return;
    updateProfileMutation.mutate(values);
  };

  const handleCancel = () => {
    // 重置為原始值
    if (userData?.displayName) {
      reset({ displayName: userData.displayName });
    }
    // 返回設定頁面
    router.push('/settings');
  };

  const handleBack = () => {
    router.push('/settings');
  };

  if (authLoading) {
    return <Loading description="載入中..." style={{ height: '100vh', width: '100%' }} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={contentWrapper}>
          <div className={pageHeader}>
            <button className={backButton} onClick={handleBack}>
              <ArrowLeftIcon />
            </button>
            <h1>修改名稱</h1>
          </div>

          <div className={settingsCard}>
            <div className={formContainer}>
              <div className={formGroup}>
                <label className={label} htmlFor="displayName">
                  名稱
                </label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="請輸入名稱"
                  className={`${input} ${!!errors.displayName ? inputError : ''}`}
                  disabled={updateProfileMutation.isPending}
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <span className={errorText}>{errors.displayName.message}</span>
                )}
              </div>

              <div className={buttonGroup}>
                <button
                  type="button"
                  className={`${button} ${buttonSecondary}`}
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  取消
                </button>
                <button
                  type="button"
                  className={`${button} ${buttonPrimary}`}
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending || !hasChanges}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className={loadingSpinner} />
                      更新中...
                    </>
                  ) : (
                    <>
                      <CheckIcon />
                      儲存變更
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
