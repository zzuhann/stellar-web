/**
 * 移除社交媒體帳號最前面的 @ 符號
 */
export const cleanSocialMediaHandle = (handle: string): string => {
  return handle.startsWith('@') ? handle.slice(1) : handle;
};
