'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
}

interface PendingNavigation {
  fromPathname: string;
  toPathname: string;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPendingTimeout = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handlePopState = () => {
      clearPendingTimeout();
      setPendingNavigation(null);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;

        setPendingNavigation({
          fromPathname: window.location.pathname,
          toPathname: url.pathname,
        });
        clearPendingTimeout();
        timeoutRef.current = window.setTimeout(() => {
          setPendingNavigation(null);
          timeoutRef.current = null;
        }, 5000);
      } catch {
        // Ignore malformed href
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('popstate', handlePopState);
      clearPendingTimeout();
    };
  }, []);

  const isLoading =
    pendingNavigation !== null &&
    pathname === pendingNavigation.fromPathname &&
    pathname !== pendingNavigation.toPathname;

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--colors-alpha-white-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--colors-gray-200)',
              borderTop: '3px solid var(--colors-stellar-blue-500)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </LoadingContext.Provider>
  );
};
