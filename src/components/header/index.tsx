'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AuthModal from '../auth/AuthModal';
import { css } from '@/styled-system/css';
import DesktopNav from './DesktopNav';
import BurgerButton from './BurgerButton';
import MobileMenu from './MobileMenu';
import ShareButton from '../ShareButton';
import MobileBackButton, { shouldShowMobileBackButton } from './MobileBackButton';

const headerContainer = css({
  height: '70px',
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  zIndex: '50',
  paddingY: '4',
  paddingX: '6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.medium',
  boxShadow: 'shadow.md',
  backgroundColor: 'color.background.primary',
  boxSizing: 'border-box',
});

const srOnly = css({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});

const logoLink = css({
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: '44px',
  minHeight: '44px',
});

const leftSlot = css({
  display: 'flex',
  alignItems: 'center',
});

const hideLogoOnMobile = css({
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

const logoImage = css({
  width: '120px',
  height: 'auto',
  display: 'block',
});

const Header = () => {
  const { authModalOpen, toggleAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const pathname = usePathname();
  const showMobileBackButton = shouldShowMobileBackButton(pathname);

  if (pathname.startsWith('/map/')) return null;

  return (
    <>
      <header className={headerContainer}>
        <h1 className={srOnly}>STELLAR | 台灣生日應援地圖平台</h1>
        <div className={leftSlot}>
          <MobileBackButton pathname={pathname} />
          <Link
            href="/"
            className={`${logoLink} ${showMobileBackButton ? hideLogoOnMobile : ''}`}
            aria-label="STELLAR 首頁"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-with-text.png"
              alt="STELLAR"
              width={120}
              height={120}
              className={logoImage}
              loading="eager"
              decoding="async"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Mobile Burger Menu Button */}
        <div
          className={css({
            display: 'none',
            '@media (max-width: 768px)': {
              display: 'flex',
              gap: '3',
            },
          })}
        >
          <ShareButton />
          <BurgerButton
            onClick={() => setMobileMenuOpen(true)}
            ariaExpanded={mobileMenuOpen}
            ariaLabel={mobileMenuOpen ? '關閉選單' : '開啟選單'}
          />
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} closeMobileMenu={closeMobileMenu} />
      <AuthModal isOpen={authModalOpen} onClose={toggleAuthModal} initialMode="signin" />
    </>
  );
};

export default Header;
