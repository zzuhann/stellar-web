'use client';

import { css } from '@/styled-system/css';
import GoogleLoginButton from './GoogleLoginButton';
import AnonymousLoginButton from './AnonymousLoginButton';
import LoginHint from './LoginHint';
import { useAnonymousLoginEnabled } from '@/hooks/useAnonymousLoginEnabled';

const formContainer = css({
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
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
  const { isEnabled: isAnonymousLoginEnabled } = useAnonymousLoginEnabled();
  return (
    <div className={formContainer}>
      <LoginHint />

      <div className={buttonGroup}>
        <GoogleLoginButton onSuccess={onSuccess} />
        {isAnonymousLoginEnabled && <AnonymousLoginButton onSuccess={onSuccess} />}
      </div>
    </div>
  );
}
