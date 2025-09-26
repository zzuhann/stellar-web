'use client';

import { Suspense } from 'react';

import MySubmissions from '@/components/MySubmissions';
import Loading from '@/components/Loading';
import { css } from '@/styled-system/css';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '600px',
  margin: '0 auto',
  padding: '100px 16px 40px',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

export default function MySubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className={pageContainer}>
          <div className={mainContainer}>
            <Loading description="載入中..." height="100vh" />
          </div>
        </div>
      }
    >
      <QueryStateProvider>
        <MySubmissions />
      </QueryStateProvider>
    </Suspense>
  );
}
