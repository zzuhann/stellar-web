import { useEffect } from 'react';

/**
 * 防止背景滾動的 hook
 * 當 modal 或 bottomsheet 開啟時使用
 *
 * 直接控制 document.documentElement 的 overflow 樣式
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // 保存原本的 overflow 值
    const originalOverflow = document.documentElement.style.overflow;

    // 設定為 hidden 來防止滾動
    document.documentElement.style.overflow = 'hidden';

    // 清理函數：恢復原本的 overflow 值
    return () => {
      document.documentElement.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}
