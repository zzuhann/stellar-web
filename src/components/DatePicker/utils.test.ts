import { describe, it, expect } from 'vitest';
import { isDisabled, isSelected, formatDisplayDate } from './utils';

// isDisabled/isSelected/formatDisplayDate 這幾個測試不依賴測試環境的本地時區——
// min/max/value 都是「YYYY-MM-DD」字串，內部經 parseTaipeiDateString 明確綁定
// Asia/Taipei 解析，跟 date 參數（本地元件建構的日曆格子）比較。刻意在多個
// TZ 環境下（見驗證流程）重跑這份測試，確認結果不受測試環境時區影響。

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
    // date-only 字串會被當成 UTC 午夜解析；沒有綁定 Asia/Taipei 的話，在 UTC 之前
    // 的時區（例如美西）下讀回來的本地日期會少一天，這裡驗證修正後不會發生
    expect(formatDisplayDate('2026-01-01')).toBe('2026/01/01');
    expect(formatDisplayDate('2026-12-31')).toBe('2026/12/31');
  });
});
