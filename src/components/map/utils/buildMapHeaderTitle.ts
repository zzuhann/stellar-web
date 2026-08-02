// 組合 map 頁 header 標題文字：stageName 與 stageNameZh 並列顯示（不含 realName）。
// stageNameZh 若為空字串（非 null/undefined）也視為不存在，只顯示 stageName。
export const buildMapHeaderTitle = (
  stageName: string | undefined | null,
  stageNameZh: string | undefined | null
): string => {
  const normalizedStageName = stageName?.trim() ? stageName : '';
  if (!normalizedStageName) return '';

  const normalizedStageNameZh = stageNameZh || undefined;

  return normalizedStageNameZh
    ? `${normalizedStageName} ${normalizedStageNameZh}的生日應援地圖`
    : `${normalizedStageName} 的生日應援地圖`;
};
