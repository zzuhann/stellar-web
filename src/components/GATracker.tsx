'use client';

import { useEffect } from 'react';
import { isPWAMode } from '@/utils/pwa';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 User Properties 初始化
 * 設定後所有事件都會自動帶上這些屬性
 */
export default function GATracker() {
  useEffect(() => {
    const setUserProperties = () => {
      if (!window.gtag) return;

      window.gtag('set', 'user_properties', {
        environment: isPWAMode() ? 'pwa' : 'web',
      });
    };

    if (window.gtag) {
      setUserProperties();
    } else {
      const timer = setTimeout(setUserProperties, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
