'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Loading from '@/components/Loading';

export default function AdminNewLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, userData, loading, router]);

  if (loading || !user || userData?.role !== 'admin') {
    return <Loading style={{ height: '100dvh' }} />;
  }

  return <>{children}</>;
}
