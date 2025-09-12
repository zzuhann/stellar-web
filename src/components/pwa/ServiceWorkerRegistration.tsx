'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('SW registered (dev mode): ', registration);
          }

          // 監聽 SW 更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新版本可用，提示用戶刷新
                  toast(
                    () => (
                      <div onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
                        🔄 \ 版本更新，點擊重新整理頁面吧 /
                      </div>
                    ),
                    { duration: 10000 }
                  );
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('SW registration failed: ', registrationError);
          }
        });
    }
  }, []);

  return null;
}
