import { cva } from '@/styled-system/css';
import Loading from '../Loading';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signInAnonymously } from '@/lib/auth';
import showToast from '@/lib/toast';

const anonymousButton = cva({
  base: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: 'radius.lg',
    background: 'color.background.secondary',
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
      background: 'color.background.tertiary',
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

type AnonymousLoginButtonProps = {
  onSuccess?: () => void;
};

const AnonymousLoginButton = ({ onSuccess }: AnonymousLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchUserDataByUid } = useAuth();

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);

    try {
      const { user, error } = await signInAnonymously();

      if (error) {
        showToast.error('匿名登入失敗');
      } else if (user) {
        await fetchUserDataByUid(user.uid);
        showToast.success('以訪客模式登入');
        onSuccess?.();
      }
    } catch {
      showToast.error('匿名登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAnonymousSignIn}
      className={anonymousButton({ loading: isLoading })}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loading
          description="登入中..."
          style={{ width: '100%', border: 'none', background: 'transparent' }}
        />
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
              fill="currentColor"
            />
          </svg>
          以訪客模式繼續
        </>
      )}
    </button>
  );
};

export default AnonymousLoginButton;
