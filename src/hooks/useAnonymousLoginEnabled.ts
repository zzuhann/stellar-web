'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const STORAGE_KEY = 'test_anonymous_login';

export function useAnonymousLoginEnabled() {
  const searchParams = useSearchParams();
  const { userData, loading: authLoading } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // 1. 檢查 URL query parameter
    const urlParam = searchParams.get('test_anonymous');

    if (urlParam === 'true') {
      // 存到 localStorage
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsEnabled(true);
      return;
    }

    if (urlParam === 'false') {
      // 關閉功能並清除 localStorage
      localStorage.removeItem(STORAGE_KEY);
      setIsEnabled(false);
      return;
    }

    // 2. 檢查 localStorage
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === 'true') {
      setIsEnabled(true);
      return;
    }

    // 3. 檢查是否為 admin
    if (userData?.role === 'admin') {
      setIsEnabled(true);
      return;
    }

    // 預設關閉
    setIsEnabled(false);
  }, [searchParams, userData?.role, authLoading]);

  return { isEnabled, loading: authLoading };
}
