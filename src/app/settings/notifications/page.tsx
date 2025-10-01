'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { css } from '@/styled-system/css';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import NotificationManager from '@/components/notifications/PushNotificationManager';
import { useEffect } from 'react';
import Loading from '@/components/Loading';

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
    background: 'color.background.primary',
    borderColor: 'color.border.medium',
  },
  '& svg': {
    width: '20px',
    height: '20px',
    color: 'color.text.secondary',
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
    return <Loading description="載入設定中..." style={{ height: '100vh', width: '100%' }} />;
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
            <h1>推播通知</h1>
          </div>

          <div className={settingsCard}>
            <NotificationManager />
          </div>
        </div>
      </div>
    </div>
  );
}
