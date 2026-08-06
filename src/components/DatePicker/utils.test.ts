import { describe, it, expect } from 'vitest';
import { isDisabled, isSelected, formatDisplayDate } from './utils';

// min/max/value 皆為 YYYY-MM-DD 字串並經 parseTaipeiDateString 解析，故這些測試
// 結果不受測試環境本地時區影響

describe('isDisabled', () => {
  it('date 早於 min 時應被停用', () => {
    const date = new Date(2026, 7, 5); // 2026-08-05
    expect(isDisabled({ date, min: '2026-08-06' })).toBe(true);
  });

  it('date 等於 min 時不應被停用', () => {
    const date = new Date(2026, 7, 6);
    expect(isDisabled({ date, min: '2026-08-06' })).toBe(false);
  });

  it('date 晚於 min 時不應被停用', () => {
    const date = new Date(2026, 7, 7);
    expect(isDisabled({ date, min: '2026-08-06' })).toBe(false);
  });

  it('date 晚於 max 時應被停用', () => {
    const date = new Date(2026, 7, 10);
    expect(isDisabled({ date, max: '2026-08-05' })).toBe(true);
  });

  it('date 等於 max 時不應被停用', () => {
    const date = new Date(2026, 7, 5);
    expect(isDisabled({ date, max: '2026-08-05' })).toBe(false);
  });

  it('沒有 min/max 時永遠不停用', () => {
    const date = new Date(2026, 7, 5);
    expect(isDisabled({ date })).toBe(false);
  });

  it('min 跨月邊界正確（1 月 31 日 vs 2 月 1 日）', () => {
    expect(isDisabled({ date: new Date(2026, 0, 31), min: '2026-02-01' })).toBe(true);
    expect(isDisabled({ date: new Date(2026, 1, 1), min: '2026-02-01' })).toBe(false);
  });

  it('min 跨年邊界正確（去年 12/31 vs 今年 1/1）', () => {
    expect(isDisabled({ date: new Date(2025, 11, 31), min: '2026-01-01' })).toBe(true);
    expect(isDisabled({ date: new Date(2026, 0, 1), min: '2026-01-01' })).toBe(false);
  });
});

describe('isSelected', () => {
  it('value 為空字串時回傳 false', () => {
    expect(isSelected(new Date(2026, 7, 5), '')).toBe(false);
  });

  it('date 與 value 是同一天時回傳 true', () => {
    expect(isSelected(new Date(2026, 7, 5), '2026-08-05')).toBe(true);
  });

  it('date 與 value 不同天時回傳 false', () => {
    expect(isSelected(new Date(2026, 7, 6), '2026-08-05')).toBe(false);
  });

  it('同一天但不同月份不會誤判', () => {
    expect(isSelected(new Date(2026, 8, 5), '2026-08-05')).toBe(false); // 9/5 vs 8/5
  });

  it('同一天但不同年份不會誤判', () => {
    expect(isSelected(new Date(2027, 7, 5), '2026-08-05')).toBe(false);
  });
});

describe('formatDisplayDate', () => {
  it('空字串回傳空字串', () => {
    expect(formatDisplayDate('')).toBe('');
  });

  it('正確格式化為 YYYY/MM/DD', () => {
    expect(formatDisplayDate('2026-08-05')).toBe('2026/08/05');
  });

  it('年初/年底日期正確顯示，不受測試環境本地時區影響', () => {
    // 未綁定 Asia/Taipei 時，UTC 之前的時區（如美西）讀回的本地日期會少一天
    expect(formatDisplayDate('2026-01-01')).toBe('2026/01/01');
    expect(formatDisplayDate('2026-12-31')).toBe('2026/12/31');
  });
});
