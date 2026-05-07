'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

/**
 * Microsoft Clarity analytics – initializes with NEXT_PUBLIC_CLARITY_PROJECT_ID.
 * Set to run in all environments so you can verify on localhost; change to
 * `if (projectId && process.env.NODE_ENV === 'production')` to exclude dev.
 */
export default function ClarityInit() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (projectId) {
      Clarity.init(projectId);
    }

    // 把全站 JS error 寫進 Clarity custom tag，方便在 session recording 對齊
    // 用於追蹤 issue #26 (t.classList) 跟 #27 (Script error.) 的真實來源
    const errorHandler = (event: ErrorEvent) => {
      if (typeof window.clarity !== 'function') return;
      const message = event.message || 'unknown';
      const filename = event.filename || 'unknown';
      const stack = event.error?.stack?.slice(0, 300) || 'no stack (likely cross-origin)';
      window.clarity('set', 'js_error_message', message);
      window.clarity('set', 'js_error_source', filename);
      window.clarity('set', 'js_error_stack', stack);
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (typeof window.clarity !== 'function') return;
      const reason =
        event.reason instanceof Error
          ? `${event.reason.message} | ${event.reason.stack?.slice(0, 200) ?? ''}`
          : String(event.reason).slice(0, 300);
      window.clarity('set', 'unhandled_rejection', reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  return null;
}
