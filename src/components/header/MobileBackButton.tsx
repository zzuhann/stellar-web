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
    !pathname.startsWith('/map/') &&
    pathname !== '/admin' &&
    !pathname.startsWith('/admin/') &&
    pathname !== '/admin-new' &&
    !pathname.startsWith('/admin-new/')
  );
}

// history 追蹤排除清單跟按鈕顯示排除清單不同：地圖頁（/map/*）跟首頁（/）
// 雖然不顯示全域返回鍵，但仍是合法的返回目的地，必須能被記進 routeStack。
// 只有 admin 區域要跟公開頁面的返回歷史隔離，進出時清空 stack。
function isTrackableRoute(pathname: string) {
  return (
    pathname !== '/admin' &&
    !pathname.startsWith('/admin/') &&
    pathname !== '/admin-new' &&
    !pathname.startsWith('/admin-new/')
  );
}

export default function MobileBackButton({ pathname }: MobileBackButtonProps) {
  const router = useRouter();
  const currentPath = useRef(pathname);
  const routeStack = useRef<string[]>([]);
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
      if (routeStack.current.at(-1) === pathname) routeStack.current.pop();
      else routeStack.current = [];
      nativeBack.current = false;
    } else if (isTrackableRoute(currentPath.current) && isTrackableRoute(pathname)) {
      routeStack.current.push(currentPath.current);
    } else {
      routeStack.current = [];
    }

    currentPath.current = pathname;
  }, [pathname]);

  if (!shouldShowMobileBackButton(pathname)) return null;

  const handleBack = () => {
    appBack.current = true;
    if (routeStack.current.length > 0) {
      routeStack.current.pop();
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
