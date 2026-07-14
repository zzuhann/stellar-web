'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

const backButton = css({
  display: 'none',
  width: '44px',
  height: '44px',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: 'radius.md',
  background: 'transparent',
  color: 'color.text.primary',
  cursor: 'pointer',
  '@media (max-width: 768px)': {
    display: 'inline-flex',
  },
});

interface MobileBackButtonProps {
  pathname: string;
}

export function shouldShowMobileBackButton(pathname: string) {
  return (
    pathname !== '/' &&
    pathname !== '/admin' &&
    !pathname.startsWith('/admin/') &&
    pathname !== '/admin-new' &&
    !pathname.startsWith('/admin-new/')
  );
}

export default function MobileBackButton({ pathname }: MobileBackButtonProps) {
  const router = useRouter();
  const currentPath = useRef(pathname);
  const inSiteDepth = useRef(0);
  const nativeBack = useRef(false);
  const appBack = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      nativeBack.current = true;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentPath.current === pathname) return;

    if (appBack.current) {
      appBack.current = false;
      nativeBack.current = false;
    } else if (nativeBack.current) {
      inSiteDepth.current = Math.max(0, inSiteDepth.current - 1);
      nativeBack.current = false;
    } else {
      inSiteDepth.current += 1;
    }

    currentPath.current = pathname;
  }, [pathname]);

  if (!shouldShowMobileBackButton(pathname)) return null;

  const handleBack = () => {
    appBack.current = true;
    if (inSiteDepth.current > 0) {
      inSiteDepth.current -= 1;
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button type="button" className={backButton} aria-label="返回上一頁" onClick={handleBack}>
      <ArrowLeftIcon width={24} height={24} aria-hidden="true" />
    </button>
  );
}
