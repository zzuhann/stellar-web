'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
    let timeoutId: NodeJS.Timeout;

    // 監聽路由變化
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (href, options) => {
      // 解析當前 URL 和目標 URL
      const currentUrl = new URL(pathname, window.location.origin);
      const targetUrl = new URL(href, window.location.origin);

      // 只有當路徑不同時才顯示 loading（忽略 query 參數的變化）
      if (targetUrl.pathname !== currentUrl.pathname) {
        setIsLoading(true);
        // 設定一個最大超時時間，防止 loading 卡住
        timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
      return originalPush(href, options);
    };

    router.replace = (href, options) => {
      // 解析當前 URL 和目標 URL
      const currentUrl = new URL(pathname, window.location.origin);
      const targetUrl = new URL(href, window.location.origin);

      // 只有當路徑不同時才顯示 loading（忽略 query 參數的變化）
      if (targetUrl.pathname !== currentUrl.pathname) {
        setIsLoading(true);
        // 設定一個最大超時時間，防止 loading 卡住
        timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
      return originalReplace(href, options);
    };

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
