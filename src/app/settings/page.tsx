'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import styled from 'styled-components';
import { UserIcon, BellIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAGS } from '@/constants';

// 設定項目介面
interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  value?: string;
  isVerified?: boolean;
  onClick: () => void;
}

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

const SettingsSection = styled.div`
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  padding: 20px 20px 8px 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const SettingItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 16px;

  svg {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
  }
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
`;

const ItemValue = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerifiedBadge = styled.span`
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
`;

const ChevronContainer = styled.div`
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
    color: var(--color-text-tertiary);
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

// 設定項目元件
function SettingItem({ item }: { item: SettingItem }) {
  return (
    <SettingItemContainer onClick={item.onClick}>
      <IconContainer>
        <item.icon />
      </IconContainer>
      <ItemContent>
        <ItemTitle>{item.title}</ItemTitle>
        {item.value && (
          <ItemValue>
            {item.value}
            {item.isVerified && <VerifiedBadge>已驗證</VerifiedBadge>}
          </ItemValue>
        )}
        {item.subtitle && !item.value && <ItemValue>{item.subtitle}</ItemValue>}
      </ItemContent>
      <ChevronContainer>
        <ChevronRightIcon />
      </ChevronContainer>
    </SettingItemContainer>
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
    <PageContainer>
      <MainContainer>
        <ContentWrapper>
          <PageHeader>
            <h1>設定</h1>
          </PageHeader>

          <SettingsSection>
            <SectionTitle>帳戶資料</SectionTitle>
            {accountItems.map((item) => (
              <SettingItem key={item.id} item={item} />
            ))}
            {!isNotificationsLoading && isNotificationsEnabled && (
              <>
                <SectionTitle>通知</SectionTitle>
                {appItems.map((item) => (
                  <SettingItem key={item.id} item={item} />
                ))}
              </>
            )}
          </SettingsSection>
        </ContentWrapper>
      </MainContainer>
    </PageContainer>
  );
}
