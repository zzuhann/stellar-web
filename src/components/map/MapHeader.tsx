'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import MobileMenu from '@/components/header/MobileMenu';
import Skeleton from '@/components/ui/Skeleton';

const headerContainer = css({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  height: '70px',
  zIndex: '51',
  backgroundColor: 'color.background.primary',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.medium',
  boxShadow: 'shadow.md',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const innerContainer = css({
  width: '100%',
  maxWidth: '600px',
  paddingX: '4',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const backButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  minHeight: '44px',
  flexShrink: '0',
  color: 'color.text.primary',
  borderRadius: 'radius.sm',
  transition: 'background 0.2s ease',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.text.primary',
    outlineOffset: '2px',
  },
});

const titleContainer = css({
  flex: '1',
  overflow: 'hidden',
  textAlign: 'center',
});

const titleText = css({
  fontWeight: 'semibold',
  color: 'color.text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  fontSize: 'clamp(12px, 3.8vw, 15px)',
});

const burgerButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  minHeight: '44px',
  flexShrink: '0',
  background: 'none',
  border: 'none',
  color: 'color.text.primary',
  cursor: 'pointer',
  borderRadius: 'radius.sm',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
});

interface MapHeaderProps {
  artistName: string;
  isLoading?: boolean;
}

export default function MapHeader({ artistName, isLoading }: MapHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <header className={headerContainer}>
        <div className={innerContainer}>
          <button type="button" className={backButton} aria-label="返回上一頁" onClick={handleBack}>
            <ArrowLeftIcon width={22} height={22} aria-hidden="true" />
          </button>

          <div className={titleContainer}>
            {isLoading ? (
              <Skeleton
                width="140px"
                height="16px"
                borderRadius="4px"
                style={{ margin: '0 auto' }}
              />
            ) : (
              <span className={titleText}>{artistName}的生日應援地圖</span>
            )}
          </div>

          <button
            type="button"
            className={burgerButton}
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
          >
            <Bars3Icon width={24} height={24} aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} closeMobileMenu={() => setMobileMenuOpen(false)} />
    </>
  );
}
