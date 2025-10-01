import { cva } from '@/styled-system/css';
import Loading from '../Loading';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signInWithGoogle } from '@/lib/auth';
import showToast from '@/lib/toast';

const googleButton = cva({
  base: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: 'radius.lg',
    background: 'white',
    border: '1px solid',
    borderColor: 'color.border.light',
    color: 'color.text.primary',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    '&:hover:not(:disabled)': {
      background: 'color.background.secondary',
      borderColor: 'color.border.medium',
      transform: 'translateY(-1px)',
      boxShadow: 'shadow.sm',
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
  variants: {
    loading: {
      true: {
        cursor: 'not-allowed',
        opacity: '0.7',
      },
      false: {
        cursor: 'pointer',
        opacity: '1',
      },
    },
  },
});

type GoogleLoginButtonProps = {
  onSuccess?: () => void;
};

const GoogleLoginButton = ({ onSuccess }: GoogleLoginButtonProps) => {
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
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className={googleButton({ loading: isGoogleLoading })}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <Loading
          description="登入中..."
          style={{ width: '100%', border: 'none', background: 'transparent' }}
        />
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="20" height="20">
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
    </button>
  );
};

export default GoogleLoginButton;
