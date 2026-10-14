'use client';

import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { css } from '@/styled-system/css';

const SubmitEventClient = dynamicImport(
  () => import('../../components/submitEvent/SubmitEventClient'),
  {
    ssr: false,
  }
);

const fallbackContainer = css({
  minHeight: '100vh',
  background: 'color.background.secondary',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const fallbackContent = css({
  textAlign: 'center',
});

const spinner = css({
  width: '48px',
  height: '48px',
  border: '3px solid',
  borderColor: 'color.border.light',
  borderTop: '3px solid',
  borderTopColor: 'color.primary',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  marginTop: '0',
  marginX: 'auto',
  marginBottom: '4',
});

const loadingText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: 0,
});

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

function SubmitEventFallback() {
  return (
    <div className={fallbackContainer}>
      <div className={fallbackContent}>
        <div className={spinner} />
        <p className={loadingText}>載入中...</p>
      </div>
    </div>
  );
}

export default function SubmitEventPage() {
  return (
    <div className={pageContainer}>
      <Suspense fallback={<SubmitEventFallback />}>
        <SubmitEventClient />
      </Suspense>
    </div>
  );
}
