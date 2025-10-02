import showToast from '@/lib/toast';
import { useCallback } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface UseWebShareReturn {
  share: (data?: ShareData) => Promise<void>;
}

export function useWebShare(): UseWebShareReturn {
  // 檢查是否支援 Web Share API
  const isSupported =
    typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;

  const share = useCallback(
    async (data: ShareData = {}) => {
      const defaultData: ShareData = {
        title: 'STELLAR 台灣生日應援地圖',
        text: '在 STELLAR 尋找在你附近的生日應援吧！',
        url: typeof window !== 'undefined' ? window.location.href : '',
        ...data,
      };

      try {
        // 檢查是否支援且可以分享此資料
        if (isSupported && navigator.canShare?.(defaultData)) {
          await navigator.share(defaultData);
        } else {
          // Fallback: 複製到剪貼簿
          await navigator.clipboard.writeText(defaultData.url || '');
          showToast.success('連結已複製到剪貼簿');
        }
      } catch (error) {
        // 檢查是否為用戶取消分享
        if ((error as Error).name === 'AbortError') {
          // 用戶取消分享，不顯示錯誤訊息
          return;
        }

        // 其他錯誤才顯示失敗訊息
        showToast.error('分享失敗');
      }
    },
    [isSupported]
  );

  return {
    share,
  };
}
