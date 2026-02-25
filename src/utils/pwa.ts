/**
 * 檢查是否在 PWA 模式下運行
 * @returns 如果在 standalone 或 fullscreen 模式下運行，返回 true
 */
export const isPWAMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 檢查是否在 standalone 模式運行
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // 檢查是否在 fullscreen 模式運行
  if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }

  // 檢查是否為 iOS Safari 的 standalone 模式
  if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
    return true;
  }

  return false;
};
