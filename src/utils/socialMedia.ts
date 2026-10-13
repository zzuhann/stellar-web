/**
 * 移除社交媒體帳號前後空白與開頭所有連續的 @（含其後空白）
 */
export const cleanSocialMediaHandle = (handle: string): string => {
  return handle.trim().replace(/^@+\s*/, '');
};

/**
 * 處理可能包含多個帳號（用逗號分隔）的字串
 * @param handles - 單個或多個帳號，如 'account1, account2' 或 'account1,account2'
 * @returns 清理過的帳號陣列
 */
export const parseSocialMediaHandles = (handles: string): string[] => {
  return handles
    .split(',')
    .map((handle) => cleanSocialMediaHandle(handle))
    .filter((handle) => handle.length > 0);
};
