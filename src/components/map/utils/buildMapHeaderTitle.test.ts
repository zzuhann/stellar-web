import { describe, it, expect } from 'vitest';
import { buildMapHeaderTitle } from './buildMapHeaderTitle';

describe('buildMapHeaderTitle', () => {
  // TC-003：stageName 與 stageNameZh 皆存在，中英混排空格規則
  it('stageName 與 stageNameZh 皆存在 → 兩者並列，英文/中文之間一個半形空格', () => {
    expect(buildMapHeaderTitle('IU', '李知恩')).toBe('IU 李知恩的生日應援地圖');
  });

  // TC-002：只有 stageName（無 stageNameZh）
  it('只有 stageName（stageNameZh 為 undefined） → 顯示 stageName + 的生日應援地圖', () => {
    expect(buildMapHeaderTitle('BLACKPINK', undefined)).toBe('BLACKPINK 的生日應援地圖');
  });

  it('只有 stageName（stageNameZh 為 null） → 顯示 stageName + 的生日應援地圖', () => {
    expect(buildMapHeaderTitle('BLACKPINK', null)).toBe('BLACKPINK 的生日應援地圖');
  });

  // TC-012：stageNameZh 為空字串（非 undefined/null）也視為不存在
  it('stageNameZh 為空字串 "" → 視為不存在，只顯示 stageName，不出現多餘空白', () => {
    expect(buildMapHeaderTitle('BLACKPINK', '')).toBe('BLACKPINK 的生日應援地圖');
  });

  it('stageNameZh 為純空白字串 "   " → 同樣視為不存在，不出現多餘空白', () => {
    expect(buildMapHeaderTitle('BLACKPINK', '   ')).toBe('BLACKPINK 的生日應援地圖');
  });

  it('stageName 為純空白字串 "   " → 視為不存在，回傳空字串', () => {
    expect(buildMapHeaderTitle('   ', '李知恩')).toBe('');
  });

  it('stageName 不存在（尚未載入） → 回傳空字串，不組出殘缺標題', () => {
    expect(buildMapHeaderTitle('', undefined)).toBe('');
    expect(buildMapHeaderTitle(undefined, '中文名')).toBe('');
    expect(buildMapHeaderTitle(null, null)).toBe('');
  });
});
