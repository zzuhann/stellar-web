// 固定主標題，名字作為 eyebrow 顯示在上方，避免長名字擠斷「應援」中間。
export const MAP_HEADER_TITLE = '生日應援地圖';

// 組合 map 頁 header 的 eyebrow（名字行）：stageName 與 stageNameZh 並列顯示（不含 realName）。
// stageNameZh 若為空字串（非 null/undefined）也視為不存在，只顯示 stageName。
export const buildMapHeaderTitle = (
  stageName: string | undefined | null,
  stageNameZh: string | undefined | null
): string => {
  const normalizedStageName = stageName?.trim() || '';
  if (!normalizedStageName) return '';

  const normalizedStageNameZh = stageNameZh?.trim() || undefined;

  return normalizedStageNameZh
    ? `${normalizedStageName} ${normalizedStageNameZh}`
    : normalizedStageName;
};
