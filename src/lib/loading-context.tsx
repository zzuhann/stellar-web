'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    const handleComplete = () => {
      setIsLoading(false);
    };

    // 監聽路由變化
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (href, options) => {
      if (href !== pathname) {
        handleStart();
      }
      return originalPush(href, options);
    };

    router.replace = (href, options) => {
      if (href !== pathname) {
        handleStart();
      }
      return originalReplace(href, options);
    };

    // 頁面載入完成時停止 loading
    const stopLoading = () => handleComplete();

    // 監聽頁面載入事件
    window.addEventListener('beforeunload', stopLoading);

    return () => {
      window.removeEventListener('beforeunload', stopLoading);
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router, pathname]);

  // 當 pathname 改變時停止 loading
  useEffect(() => {
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
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(1px)',
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
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #6366f1',
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
