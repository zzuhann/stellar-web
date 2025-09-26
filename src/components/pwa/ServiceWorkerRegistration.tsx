'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

// 全域變數來追蹤 SW 註冊狀態
let swRegistrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // 在開發環境中不註冊 service worker
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
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

          return registration;
        })
        .catch(() => {
          swRegistrationPromise = null; // 重置以便重試
          return null;
        });
    }
  }, []);

  return null;
}

// 導出函數供其他組件使用
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  if (swRegistrationPromise) {
    return swRegistrationPromise;
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.ready;
    } catch {
      return null;
    }
  }

  return null;
}
