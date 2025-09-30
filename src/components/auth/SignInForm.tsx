'use client';

import { css } from '@/styled-system/css';
import GoogleLoginButton from './GoogleLoginButton';
import LoginHint from './LoginHint';

const formContainer = css({
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
});

interface SignInFormProps {
  onSuccess?: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  return (
    <div className={formContainer}>
      <LoginHint />

      <GoogleLoginButton onSuccess={onSuccess} />
    </div>
  );
}
