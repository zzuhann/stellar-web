// Fixed heading with the artist name as eyebrow above it, so a long name never breaks the heading text.
export const MAP_HEADER_TITLE = '生日應援地圖';

// Builds the map header eyebrow: stageName and stageNameZh side by side (realName excluded).
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
