import { useEffect } from 'react';
import { useShare } from '@/context/ShareContext';

interface PageShareData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * 用於頁面設定分享資料的 hook
 * 會在頁面載入時設定分享資料，離開時自動重置
 */
export function usePageShare(shareData: PageShareData) {
  const { setShareData, resetShareData } = useShare();

  useEffect(() => {
    // 設定頁面的分享資料
    setShareData(shareData);

    // 清理函數：當頁面卸載時重置分享資料
    return () => {
      resetShareData();
    };
  }, [shareData.title, shareData.text, shareData.url, setShareData, resetShareData]);
}
