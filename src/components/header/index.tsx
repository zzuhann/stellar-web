'use client';

import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import AuthModal from '../auth/AuthModal';
import { css } from '@/styled-system/css';
import DesktopNav from './DesktopNav';
import BurgerButton from './BurgerButton';
import MobileMenu from './MobileMenu';
import ShareButton from '../ShareButton';

const headerContainer = css({
  height: '70px',
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  zIndex: '50',
  padding: '16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.medium',
  boxShadow: 'shadow.md',
  backgroundColor: 'color.background.primary',
  boxSizing: 'border-box',
});

const Header = () => {
  const { authModalOpen, toggleAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className={headerContainer}>
        <Link href="/">
          <Image
            src="/icon-with-text.png"
            alt="STELLAR"
            width={120}
            height={120}
            style={{
              width: '120px',
              height: 'auto',
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Mobile Burger Menu Button */}
        <div
          className={css({
            display: 'none',
            '@media (max-width: 768px)': {
              display: 'flex',
              gap: '12px',
            },
          })}
        >
          <ShareButton />
          <BurgerButton onClick={() => setMobileMenuOpen(true)} />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} closeMobileMenu={closeMobileMenu} />

      <AuthModal isOpen={authModalOpen} onClose={toggleAuthModal} initialMode="signin" />
    </>
  );
};

export default Header;
