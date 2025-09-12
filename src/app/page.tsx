import { Suspense } from 'react';
import HomePage from '@/components/layout/HomePage';

function HomePageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePage />
    </Suspense>
  );
}
