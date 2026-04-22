'use client';

import { css } from '@/styled-system/css';
import GoogleLoginButton from './GoogleLoginButton';
import AnonymousLoginButton from './AnonymousLoginButton';
import LoginHint from './LoginHint';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';
import Link from 'next/link';

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
  gap: '3',
});

const termsText = css({
  textStyle: 'caption',
  color: 'color.text.tertiary',
  textAlign: 'center',
  marginTop: '3',
  '& a': {
    color: 'color.text.secondary',
    textDecoration: 'underline',
  },
});

interface SignInFormProps {
  onSuccess?: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const { isInAppBrowser, loading } = useIsInAppBrowser();

  if (loading) {
    return <div className={formContainer}>載入中...</div>;
  }

  const termsNote = (
    <p className={termsText}>
      註冊/登入後即代表您同意我們的{' '}
      <Link href="/terms" target="_blank">
        服務條款
      </Link>
    </p>
  );

  // In-app browser：顯示訪客登入區塊
  if (isInAppBrowser) {
    return (
      <div className={formContainer}>
        <LoginHint />
        <AnonymousLoginButton onSuccess={onSuccess} />
        {termsNote}
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
      {termsNote}
    </div>
  );
}
