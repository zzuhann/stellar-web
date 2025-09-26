import { useAuth } from '@/lib/auth-context';
import { css } from '@/styled-system/css';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const desktopNav = css({
  display: 'flex',
  alignItems: 'center',
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

const userSection = css({
  position: 'relative',
});

const rightSection = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const userButton = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  background: 'none',
  border: 'none',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  borderRadius: 'radius.sm',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'var(--color-bg-secondary)',
  },
});

const memberButton = css({
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontWeight: 500,
});

const userMenu = css({
  position: 'absolute',
  right: '0',
  top: 'calc(100% + 8px)',
  width: '100px',
  zIndex: 10,
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  boxShadow: 'shadow.lg',
  overflow: 'hidden',
});

const userMenuItem = css({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 16px',
  fontSize: '14px',
  color: 'color.text.primary',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'var(--color-bg-secondary)',
  },
});

const description = css({
  fontSize: '14px',
  color: 'color.text.primary',
  cursor: 'pointer',
});

const styledLink = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  cursor: 'pointer',
});

const DesktopNav = () => {
  const router = useRouter();
  const { user, userData, signOut, toggleAuthModal } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className={desktopNav}>
      {user ? (
        <div className={rightSection}>
          <Link className={styledLink} href="/my-submissions">
            我的投稿
          </Link>
          <Link className={styledLink} href="/admin">
            管理員審核
          </Link>
          <Link className={styledLink} href="/submit-event">
            舉辦生日應援
          </Link>
          <div className={userSection}>
            <button className={userButton} onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <UserIcon width={16} height={16} />
              <div className={description}>{userData?.displayName || 'member'}</div>
            </button>

            {userMenuOpen && (
              <div className={userMenu}>
                <button
                  className={userMenuItem}
                  onClick={() => {
                    router.push('/settings');
                    setUserMenuOpen(false);
                  }}
                >
                  設定
                </button>
                <button
                  className={userMenuItem}
                  onClick={() => {
                    signOut();
                    setUserMenuOpen(false);
                  }}
                >
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button className={memberButton} onClick={() => toggleAuthModal()}>
          登入 / 註冊
        </button>
      )}
    </div>
  );
};

export default DesktopNav;
