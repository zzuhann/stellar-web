import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shouldShowBirthdayHat } from './birthdayHelpers';

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
