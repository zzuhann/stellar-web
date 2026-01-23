'use client';

import { useEffect, useState } from 'react';

export function useIsInAppBrowser() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;

    // 檢測常見的 in-app browser
    const inAppBrowserPatterns = [
      /FBAN|FBAV/i, // Facebook App
      /Instagram/i, // Instagram
      /Barcelona/i, // Threads
      /Line/i, // LINE
      /Twitter/i, // Twitter/X
      /Snapchat/i, // Snapchat
      /Pinterest/i, // Pinterest
      /WhatsApp/i, // WhatsApp
      /KAKAOTALK/i, // KakaoTalk
    ];

    const isIAB = inAppBrowserPatterns.some((pattern) => pattern.test(userAgent));

    setIsInAppBrowser(isIAB);
    setLoading(false);
  }, []);

  return { isInAppBrowser, loading };
}
