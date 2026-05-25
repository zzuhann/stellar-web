'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;
    const getPathnameFromHref = (href: string) => {
      try {
        return new URL(href, window.location.origin).pathname;
      } catch {
        return href;
      }
    };
    const startLoadingIfPathChanged = (href: string) => {
      const targetPathname = getPathnameFromHref(href);
      if (targetPathname !== window.location.pathname) {
        setIsLoading(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
    };

    router.push = (href, options) => {
      startLoadingIfPathChanged(String(href));
      return originalPush(href, options);
    };

    router.replace = (href, options) => {
      startLoadingIfPathChanged(String(href));
      return originalReplace(href, options);
    };

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  // 當 pathname 改變時停止 loading
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoading(false);
  }, [pathname]);

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
