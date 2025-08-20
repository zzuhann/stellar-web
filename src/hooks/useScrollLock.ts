import { useEffect } from 'react';

/**
 * 防止背景滾動的 hook
 * 當 modal 或 bottomsheet 開啟時使用
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // 記錄當前滾動位置
    const scrollY = window.scrollY;

    // 鎖定滾動
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // 清理函數：恢復滾動
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // 恢復到之前的滾動位置
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
