'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { css } from '@/styled-system/css';
import Loading from '@/components/Loading';

const unauthorizedContainer = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'color.background.primary',
});

const unauthorizedText = css({
  textStyle: 'body',
  color: 'color.text.secondary',
});

export default function AdminNewLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return <Loading style={{ height: '100dvh' }} />;
  }

  if (!user || userData?.role !== 'admin') {
    return (
      <div className={unauthorizedContainer}>
        <p className={unauthorizedText}>您沒有存取此頁面的權限</p>
      </div>
    );
  }

  return <>{children}</>;
}
