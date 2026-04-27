import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  shouldShowBirthdayHat,
  formatBirthdayMonthDay,
  formatBirthdayFull,
} from './birthdayHelpers';

describe('shouldShowBirthdayHat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('今天是生日 → 顯示帽子', () => {
    vi.setSystemTime(new Date(2025, 3, 17, 10, 0, 0)); // April 17 local
    expect(shouldShowBirthdayHat('2001-04-17')).toBe(true);
  });

  it('今天不是生日 → 不顯示', () => {
    vi.setSystemTime(new Date(2025, 3, 16, 10, 0, 0)); // April 16 local
    expect(shouldShowBirthdayHat('2001-04-17')).toBe(false);
  });

  it('空字串 → 不顯示', () => {
    vi.setSystemTime(new Date(2025, 3, 17, 10, 0, 0));
    expect(shouldShowBirthdayHat('')).toBe(false);
  });

  it('生日是跨年邊界（12/31）→ 當天顯示', () => {
    vi.setSystemTime(new Date(2025, 11, 31, 10, 0, 0)); // Dec 31 local
    expect(shouldShowBirthdayHat('2000-12-31')).toBe(true);
  });

  it('生日是 1/1 → 當天顯示', () => {
    vi.setSystemTime(new Date(2025, 0, 1, 10, 0, 0)); // Jan 1 local
    expect(shouldShowBirthdayHat('2000-01-01')).toBe(true);
  });

  describe('時區模擬', () => {
    it('【台灣時區模擬】local 已是 4/17 → 顯示帽子', () => {
      // 台灣使用者在 4/17 早上 08:00 local
      vi.setSystemTime(new Date(2025, 3, 17, 8, 0, 0));
      expect(shouldShowBirthdayHat('2001-04-17')).toBe(true);
    });

    it('【美國時區模擬】local 還在 4/16 → 不顯示帽子', () => {
      // 美國使用者 local 時間仍是 4/16，台灣已是 4/17
      vi.setSystemTime(new Date(2025, 3, 16, 17, 0, 0)); // April 16 5pm local
      expect(shouldShowBirthdayHat('2001-04-17')).toBe(false);
    });
  });
});

describe('formatBirthdayMonthDay', () => {
  it('應該格式化為「X 月 X 日」', () => {
    expect(formatBirthdayMonthDay('2001-04-17')).toBe('4 月 17 日');
  });

  it('應該處理個位數月份和日期', () => {
    expect(formatBirthdayMonthDay('2001-01-05')).toBe('1 月 5 日');
  });

  it('應該處理兩位數月份和日期', () => {
    expect(formatBirthdayMonthDay('2001-12-31')).toBe('12 月 31 日');
  });

  it('空字串應該回傳空字串', () => {
    expect(formatBirthdayMonthDay('')).toBe('');
  });

  it('無效格式應該回傳空字串', () => {
    expect(formatBirthdayMonthDay('invalid')).toBe('');
    expect(formatBirthdayMonthDay('2001-13-01')).toBe('13 月 1 日'); // 不驗證月份範圍
  });
});

describe('formatBirthdayFull', () => {
  it('應該格式化為「YYYY/M/D」', () => {
    expect(formatBirthdayFull('2001-04-17')).toBe('2001/4/17');
  });

  it('應該處理個位數月份和日期', () => {
    expect(formatBirthdayFull('2001-01-05')).toBe('2001/1/5');
  });

  it('應該處理兩位數月份和日期', () => {
    expect(formatBirthdayFull('2001-12-31')).toBe('2001/12/31');
  });

  it('空字串應該回傳空字串', () => {
    expect(formatBirthdayFull('')).toBe('');
  });

  it('無效格式應該回傳空字串', () => {
    expect(formatBirthdayFull('invalid')).toBe('');
  });
});
