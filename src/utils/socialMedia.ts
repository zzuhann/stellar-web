/**
 * 移除社交媒體帳號最前面的 @ 符號
 */
export const cleanSocialMediaHandle = (handle: string): string => {
  return handle.startsWith('@') ? handle.slice(1) : handle;
};

/**
 * 處理可能包含多個帳號（用逗號分隔）的字串
 * @param handles - 單個或多個帳號，如 'account1, account2' 或 'account1,account2'
 * @returns 清理過的帳號陣列
 */
export const parseSocialMediaHandles = (handles: string): string[] => {
  return handles
    .split(',')
    .map((handle) => handle.trim())
    .filter((handle) => handle.length > 0)
    .map((handle) => cleanSocialMediaHandle(handle));
};
