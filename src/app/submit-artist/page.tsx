'use client';

import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

const SubmitArtistClient = dynamicImport(() => import('./SubmitArtistClient'), {
  ssr: false,
});

function SubmitArtistFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--color-border-light)',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            margin: 0,
          }}
        >
          載入中...
        </p>
      </div>
    </div>
  );
}

export default function SubmitArtistPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Suspense fallback={<SubmitArtistFallback />}>
        <SubmitArtistClient />
      </Suspense>
    </div>
  );
}
