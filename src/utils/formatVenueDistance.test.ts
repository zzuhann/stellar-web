import { describe, expect, it } from 'vitest';
import { formatVenueDistance } from './formatVenueDistance';

// qa.md 情境 17–25：requirements.md 明確列出的三段式格式邊界值（2026-10 文案裁定：
// 「距離你」前綴併入可見文字本身，<100m 的「你」與數字之間有空格，其餘兩段「你約」
// 緊接無空格）
describe('formatVenueDistance', () => {
  it('99 公尺 → 距離你 100 公尺內', () => {
    expect(formatVenueDistance(99)).toBe('距離你 100 公尺內');
  });

  it('100 公尺 → 距離你約 100 公尺', () => {
    expect(formatVenueDistance(100)).toBe('距離你約 100 公尺');
  });

  it('149 公尺 → 距離你約 100 公尺（四捨五入到百位）', () => {
    expect(formatVenueDistance(149)).toBe('距離你約 100 公尺');
  });

  it('150 公尺 → 距離你約 200 公尺', () => {
    expect(formatVenueDistance(150)).toBe('距離你約 200 公尺');
  });

  it('949 公尺 → 距離你約 900 公尺', () => {
    expect(formatVenueDistance(949)).toBe('距離你約 900 公尺');
  });

  it('950 公尺 → 距離你約 1.0 公里（四捨五入後達 1000，改用公里格式）', () => {
    expect(formatVenueDistance(950)).toBe('距離你約 1.0 公里');
  });

  it('999 公尺 → 距離你約 1.0 公里', () => {
    expect(formatVenueDistance(999)).toBe('距離你約 1.0 公里');
  });

  it('1000 公尺整 → 距離你約 1.0 公里', () => {
    expect(formatVenueDistance(1000)).toBe('距離你約 1.0 公里');
  });

  it('1000.4 公尺 → 距離你約 1.0 公里', () => {
    expect(formatVenueDistance(1000.4)).toBe('距離你約 1.0 公里');
  });

  it('大於 1 公里時四捨五入到小數第 1 位（如 1234m → 距離你約 1.2 公里）', () => {
    expect(formatVenueDistance(1234)).toBe('距離你約 1.2 公里');
  });
});
