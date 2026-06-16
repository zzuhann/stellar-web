/**
 * 檢查是否在 PWA 模式下運行
 * @returns 如果在 standalone 或 fullscreen 模式下運行，返回 true
 */
export const isPWAMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia) {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
  }

  return (window.navigator as unknown as { standalone?: boolean }).standalone === true;
};
