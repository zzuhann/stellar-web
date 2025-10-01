'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { css } from '@/styled-system/css';
import { UserIcon, BellIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAGS } from '@/constants';
import Loading from '@/components/Loading';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  value?: string;
  isVerified?: boolean;
  onClick: () => void;
}

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
  textAlign: 'center',
  '& h1': {
    fontSize: '28px',
    fontWeight: 700,
    color: 'color.text.primary',
    margin: '0 0 8px 0',
  },
  '& p': {
    fontSize: '16px',
    color: 'color.text.secondary',
    margin: '0',
  },
});

const settingsSection = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  boxShadow: 'shadow.sm',
  marginBottom: '16px',
});

const sectionTitle = css({
  padding: '20px 20px 8px 20px',
  fontSize: '18px',
  fontWeight: 600,
  color: 'color.text.primary',
});

const settingItemContainer = css({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const iconContainer = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  marginRight: '16px',
  '& svg': {
    width: '20px',
    height: '20px',
    color: 'color.text.secondary',
  },
});

const itemContent = css({
  flex: 1,
  minWidth: 0,
});

const itemTitle = css({
  fontSize: '16px',
  fontWeight: 500,
  color: 'color.text.primary',
  marginBottom: '2px',
});

const itemValue = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const verifiedBadge = css({
  fontSize: '12px',
  color: '#10b981',
  fontWeight: 500,
});

const chevronContainer = css({
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    width: '16px',
    height: '16px',
    color: 'color.text.tertiary',
  },
});

// 設定項目元件
function SettingItem({ item }: { item: SettingItem }) {
  return (
    <div className={settingItemContainer} onClick={item.onClick}>
      <div className={iconContainer}>
        <item.icon />
      </div>
      <div className={itemContent}>
        <div className={itemTitle}>{item.title}</div>
        {item.value && (
          <div className={itemValue}>
            {item.value}
            {item.isVerified && <span className={verifiedBadge}>已驗證</span>}
          </div>
        )}
        {item.subtitle && !item.value && <div className={itemValue}>{item.subtitle}</div>}
      </div>
      <div className={chevronContainer}>
        <ChevronRightIcon />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { isEnabled: isNotificationsEnabled, loading: isNotificationsLoading } = useFeatureFlag(
    FEATURE_FLAGS.NOTIFICATIONS
  );

  // 權限檢查
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看設定');
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loading description="載入設定中..." style={{ height: '100vh', width: '100%' }} />;
  }

  if (!user) {
    return null;
  }

  // 帳戶資料設定項目
  const accountItems: SettingItem[] = [
    {
      id: 'displayName',
      title: '名稱',
      icon: UserIcon,
      value: userData?.displayName || '未設定',
      onClick: () => {
        router.push('/settings/display-name');
      },
    },
  ];

  // 應用程式設定項目
  const appItems: SettingItem[] = [
    {
      id: 'notifications',
      title: '推播通知',
      icon: BellIcon,
      onClick: () => {
        router.push('/settings/notifications');
      },
    },
  ];

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={contentWrapper}>
          <div className={pageHeader}>
            <h1>設定</h1>
          </div>

          <div className={settingsSection}>
            <div className={sectionTitle}>帳戶資料</div>
            {accountItems.map((item) => (
              <SettingItem key={item.id} item={item} />
            ))}
            {!isNotificationsLoading && isNotificationsEnabled && (
              <>
                <div className={sectionTitle}>通知</div>
                {appItems.map((item) => (
                  <SettingItem key={item.id} item={item} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
