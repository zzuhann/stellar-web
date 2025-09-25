'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import styled from 'styled-components';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import NotificationManager from '@/components/notifications/PushNotificationManager';
import { useEffect } from 'react';

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
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-primary);
    border-color: var(--color-border-medium);
  }

  svg {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
  }
`;

const SettingsCard = styled.div`
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
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

export default function NotificationsSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 權限檢查
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看設定');
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleBack = () => {
    router.back();
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
            <BackButton onClick={handleBack}>
              <ArrowLeftIcon />
            </BackButton>
            <h1>推播通知</h1>
          </PageHeader>

          <SettingsCard>
            <NotificationManager />
          </SettingsCard>
        </ContentWrapper>
      </MainContainer>
    </PageContainer>
  );
}
