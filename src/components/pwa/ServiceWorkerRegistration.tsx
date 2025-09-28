'use client';

import { useEffect } from 'react';

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
        .then(() => {})
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
