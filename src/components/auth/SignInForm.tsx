'use client';

import { css } from '@/styled-system/css';
import GoogleLoginButton from './GoogleLoginButton';
import AnonymousLoginButton from './AnonymousLoginButton';
import LoginHint from './LoginHint';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';

const formContainer = css({
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
  maxHeight: '60dvh',
  overflowY: 'auto',
});

const buttonGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

interface SignInFormProps {
  onSuccess?: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const { isInAppBrowser, loading } = useIsInAppBrowser();

  if (loading) {
    return <div className={formContainer}>載入中...</div>;
  }

  // In-app browser：顯示訪客登入區塊
  if (isInAppBrowser) {
    return (
      <div className={formContainer}>
        <LoginHint />
        <AnonymousLoginButton onSuccess={onSuccess} />
      </div>
    );
  }

  // 一般瀏覽器：只顯示 Google 登入
  return (
    <div className={formContainer}>
      <LoginHint />

      <div className={buttonGroup}>
        <GoogleLoginButton onSuccess={onSuccess} />
      </div>
    </div>
  );
}
