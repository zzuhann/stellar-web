import { useAuth } from '@/lib/auth-context';
import { css } from '@/styled-system/css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import UserDropdownMenu from './UserDropdownMenu';

const desktopNav = css({
  display: 'flex',
  alignItems: 'center',
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

const rightSection = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
});

const memberButton = css({
  textStyle: 'button',
  color: 'color.text.primary',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
});

const styledLink = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  cursor: 'pointer',
});

const loadingPlaceholder = css({
  width: '80px',
  height: '20px',
  borderRadius: 'radius.sm',
  background: 'color.background.secondary',
});

const DesktopNav = () => {
  const pathname = usePathname();
  const { user, userData, signOut, toggleAuthModal, loading } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (loading) {
    return (
      <nav className={desktopNav} aria-label="功能選單" aria-busy="true">
        <div className={loadingPlaceholder} />
      </nav>
    );
  }

  return (
    <nav className={desktopNav} aria-label="功能選單">
      {user ? (
        <div className={rightSection}>
          {userData?.role === 'admin' && (
            <Link className={styledLink} href="/admin">
              管理員審核
            </Link>
          )}
          <Link
            className={styledLink}
            href="/submit-event"
            onClick={() =>
              sendGAEvent('event', 'nav_submit_event', {
                event_page: pathname,
                user_id: user?.uid ?? '',
                content_id: 'desktop_nav',
              })
            }
          >
            舉辦生日應援
          </Link>
          <Link
            className={styledLink}
            href="/submit-artist"
            onClick={() =>
              sendGAEvent('event', 'nav_submit_artist', {
                event_page: pathname,
                user_id: user?.uid ?? '',
                content_id: 'desktop_nav',
              })
            }
          >
            新增藝人
          </Link>
          <UserDropdownMenu
            displayNameText={userData?.displayName || 'member'}
            isOpen={userMenuOpen}
            onToggle={() => setUserMenuOpen((prev) => !prev)}
            onClose={() => setUserMenuOpen(false)}
            onSignOut={signOut}
          />
        </div>
      ) : (
        <div className={rightSection}>
          <Link
            className={styledLink}
            href="/submit-event"
            onClick={(e) => {
              sendGAEvent('event', 'nav_submit_event', {
                event_page: pathname,
                user_id: '',
                content_id: 'desktop_nav',
              });
              e.preventDefault();
              toggleAuthModal('/submit-event');
            }}
          >
            舉辦生日應援
          </Link>
          <Link
            className={styledLink}
            href="/submit-artist"
            onClick={(e) => {
              sendGAEvent('event', 'nav_submit_artist', {
                event_page: pathname,
                user_id: '',
                content_id: 'desktop_nav',
              });
              e.preventDefault();
              toggleAuthModal('/submit-artist');
            }}
          >
            新增藝人
          </Link>
          <button className={memberButton} onClick={() => toggleAuthModal()}>
            登入 / 註冊
          </button>
        </div>
      )}
    </nav>
  );
};

export default DesktopNav;
