'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface ShareContextType {
  shareData: ShareData;
  setShareData: (data: ShareData) => void;
  resetShareData: () => void;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

const defaultShareData: ShareData = {
  title: 'STELLAR 台灣生日應援地圖',
  text: '', // 可以為空字串或省略
  url: typeof window !== 'undefined' ? window.location.href : '',
};

export function ShareProvider({ children }: { children: ReactNode }) {
  const [shareData, setShareDataState] = useState<ShareData>(defaultShareData);
  const pathname = usePathname();

  const setShareData = useCallback((data: ShareData) => {
    setShareDataState((prev) => ({
      ...prev,
      ...data,
      // 如果沒有提供 URL，使用當前頁面 URL
      url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
    }));
  }, []);

  const resetShareData = useCallback(() => {
    setShareDataState({
      ...defaultShareData,
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
  }, []);

  useEffect(() => {
    resetShareData();
  }, [pathname, resetShareData]);

  return (
    <ShareContext.Provider value={{ shareData, setShareData, resetShareData }}>
      {children}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}
