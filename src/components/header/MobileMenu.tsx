import { useAuth } from '@/lib/auth-context';
import { css, cva } from '@/styled-system/css';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const mobileMenu = cva({
  base: {
    display: 'none',
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    width: '280px',
    background: 'white',
    boxShadow: 'shadow.lg',
    transition: 'transform 0.3s ease',
    zIndex: '101',
    overflowY: 'auto',
    '@media (max-width: 768px)': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  variants: {
    isOpen: {
      true: {
        transform: 'translateX(0)',
      },
      false: {
        transform: 'translateX(100%)',
      },
    },
  },
});

const mobileMenuHeader = css({
  padding: '16px 20px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const mobileMenuTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0',
});

const closeButton = css({
  background: 'none',
  border: 'none',
  color: 'color.text.primary',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: 'radius.sm',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
});

const mobileMenuContent = css({
  flex: '1',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const mobileMenuButton = css({
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '8px 0',
  fontSize: '16px',
  color: 'color.text.primary',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const description = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  cursor: 'pointer',
});

const mobileMenuOverlay = cva({
  base: {
    display: 'none',
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: '100',
    transition: 'all 0.3s ease',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  variants: {
    isOpen: {
      true: {
        opacity: '1',
        visibility: 'visible',
      },
      false: {
        opacity: '0',
        visibility: 'hidden',
      },
    },
  },
});

type MobileMenuProps = {
  isOpen: boolean;
  closeMobileMenu: () => void;
};

const MobileMenu = ({ isOpen, closeMobileMenu }: MobileMenuProps) => {
  const router = useRouter();
  const { user, userData, signOut, toggleAuthModal } = useAuth();

  return (
    <>
      <div className={mobileMenuOverlay({ isOpen })} />
      <div className={mobileMenu({ isOpen })}>
        <div className={mobileMenuHeader}>
          <h3 className={mobileMenuTitle}>選單</h3>
          <button className={closeButton} onClick={closeMobileMenu}>
            <XMarkIcon width={24} height={24} />
          </button>
        </div>

        <div className={mobileMenuContent}>
          {user ? (
            <>
              <div className={description}>{userData?.displayName || 'member'}</div>

              <button
                className={mobileMenuButton}
                onClick={() => {
                  router.push('/my-submissions');
                  closeMobileMenu();
                }}
              >
                我的投稿
              </button>
              {userData?.role === 'admin' && (
                <button
                  className={mobileMenuButton}
                  onClick={() => {
                    router.push('/admin');
                    closeMobileMenu();
                  }}
                >
                  管理員審核
                </button>
              )}
              <button
                className={mobileMenuButton}
                onClick={() => {
                  router.push('/submit-event');
                  closeMobileMenu();
                }}
              >
                舉辦生日應援
              </button>
              <button
                className={mobileMenuButton}
                onClick={() => {
                  router.push('/settings');
                  closeMobileMenu();
                }}
              >
                設定
              </button>
              <button
                className={mobileMenuButton}
                onClick={() => {
                  signOut();
                  closeMobileMenu();
                }}
              >
                登出
              </button>
            </>
          ) : (
            <>
              <button
                className={mobileMenuButton}
                onClick={() => {
                  toggleAuthModal();
                  closeMobileMenu();
                }}
              >
                登入 / 註冊
              </button>

              <button
                className={mobileMenuButton}
                onClick={() => {
                  toggleAuthModal('/submit-event');
                  closeMobileMenu();
                }}
              >
                舉辦生日應援
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
