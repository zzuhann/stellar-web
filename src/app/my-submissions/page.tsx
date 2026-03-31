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
  paddingTop: '25',
  paddingX: '4',
  paddingBottom: '10',
  '@media (min-width: 768px)': {
    paddingX: '6',
    paddingBottom: '15',
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
