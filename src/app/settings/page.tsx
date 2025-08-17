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
import styled from 'styled-components';
import { CheckIcon } from '@heroicons/react/24/outline';

// 表單驗證 schema
const settingsSchema = z.object({
  displayName: z
    .string()
    .min(1, '顯示名稱不能為空')
    .max(50, '顯示名稱不能超過 50 個字元')
    .regex(
      /^[a-zA-Z0-9\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\s]+$/,
      '顯示名稱只能包含中文、日文、英文、數字和空格'
    ),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 100px 16px 40px;

  @media (min-width: 768px) {
    padding: 100px 24px 60px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  text-align: center;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;
  }

  p {
    font-size: 16px;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const SettingsCard = styled.div`
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const FormContainer = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${(props) => (props.hasError ? '#ef4444' : 'var(--color-border-light)')};
  border-radius: var(--radius-md);
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
  color: var(--color-text-primary);

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? '#ef4444' : 'var(--color-primary)')};
  }

  &:disabled {
    background: var(--color-bg-secondary);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) => {
    if (props.variant === 'primary') {
      return `
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
        
        &:hover:not(:disabled) {
          background: #3a5d7a;
          border-color: #3a5d7a;
        }
      `;
    } else {
      return `
        background: var(--color-bg-primary);
        border-color: var(--color-border-light);
        color: var(--color-text-primary);
        
        &:hover:not(:disabled) {
          background: var(--color-bg-secondary);
          border-color: var(--color-border-medium);
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-secondary);

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function SettingsPage() {
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
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const currentDisplayName = watch('displayName');
  const hasChanges = currentDisplayName !== userData?.displayName;

  // 更新用戶資料的 mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: SettingsFormData) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      showToast.success('設定更新成功');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      // 重置表單為新的值
      reset({ displayName: updatedUser.displayName });
      refetchUserData();
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '更新設定時發生錯誤');
    },
  });

  // 權限檢查和初始化
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看設定');
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
  };

  if (authLoading) {
    return (
      <PageContainer>
        <MainContainer>
          <LoadingContainer>
            <div className="spinner" />
            <p>載入設定中...</p>
          </LoadingContainer>
        </MainContainer>
      </PageContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <MainContainer>
        <ContentWrapper>
          <PageHeader>
            <h1>設定</h1>
          </PageHeader>

          <SettingsCard>
            <FormContainer>
              <FormGroup>
                <Label htmlFor="displayName">顯示名稱</Label>
                <Input
                  id="displayName"
                  type="text"
                  hasError={!!errors.displayName}
                  disabled={updateProfileMutation.isPending}
                  {...register('displayName')}
                />
                {errors.displayName && <ErrorText>{errors.displayName.message}</ErrorText>}
              </FormGroup>

              <ButtonGroup>
                {hasChanges && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    取消
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending || !hasChanges}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <LoadingSpinner />
                      更新中...
                    </>
                  ) : (
                    <>
                      <CheckIcon />
                      儲存變更
                    </>
                  )}
                </Button>
              </ButtonGroup>
            </FormContainer>
          </SettingsCard>
        </ContentWrapper>
      </MainContainer>
    </PageContainer>
  );
}
