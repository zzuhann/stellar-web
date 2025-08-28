'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import showToast from '@/lib/toast';

interface SignInFormProps {
  onSuccess?: () => void;
}

// Styled Components
const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
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

const GoogleButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  background: white;
  border: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: ${(props) => (props.$loading ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$loading ? 0.7 : 1)};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover:not(:disabled) {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-medium);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:disabled {
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { fetchUserDataByUid } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const { user, error } = await signInWithGoogle();

      if (error) {
        showToast.error('Google 登入失敗');
      } else if (user) {
        await fetchUserDataByUid(user.uid);
        showToast.success('登入成功');
        onSuccess?.();
      }
    } catch {
      showToast.error('Google 登入失敗');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <Title>登入帳號</Title>
        <Subtitle>
          若是從 IG / Threads / FB 開啟
          <br />
          建議先點擊右上角三個點點
          <br />
          再點擊<span style={{ color: '#8f2d28', fontWeight: 'bold' }}>「用外部瀏覽器開啟」</span>
          <br />
          登入會更容易哦！
        </Subtitle>
      </FormHeader>

      {/* Google 登入按鈕 */}
      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
        $loading={isGoogleLoading}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <LoadingContent>
            <Spinner />
            <span>登入中...</span>
          </LoadingContent>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            使用 Google 登入
          </>
        )}
      </GoogleButton>
    </FormContainer>
  );
}
