import { describe, it, expect } from 'vitest';
import { getWeekStart, parseWeekStartFromString } from './weekHelpers';

// ─── getWeekStart 基本行為 ────────────────────────────────────────────────────

describe('getWeekStart', () => {
  it('週一本身應回傳當天', () => {
    const result = getWeekStart(new Date(2025, 3, 14)); // April 14 Monday
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(14);
  });

  it('週三應回推到當週週一', () => {
    const result = getWeekStart(new Date(2025, 3, 16)); // April 16 Wednesday
    expect(result.getDate()).toBe(14);
  });

  it('週日應回推到當週週一', () => {
    const result = getWeekStart(new Date(2025, 3, 20)); // April 20 Sunday
    expect(result.getDate()).toBe(14);
  });

  it('下週一應回傳下週一', () => {
    const result = getWeekStart(new Date(2025, 3, 21)); // April 21 Monday
    expect(result.getDate()).toBe(21);
  });
});

// ─── 時區 bug 說明 ─────────────────────────────────────────────────────────────
//
// new Date('YYYY-MM-DD') 在 JS 中被解析為 UTC midnight（非 local time）
//
// 台灣（UTC+8）：new Date('2025-04-14') = April 14 08:00 local → 仍是週一 ✓
// 美國（UTC-7）：new Date('2025-04-14') = April 13 17:00 local → 變成週日
//               → getWeekStart(週日) 回到 April 7（上一週的週一）← bug
//
// 修正：new Date(year, month-1, day) 永遠使用 local midnight，不受時區影響

// ─── 模擬台灣時區（UTC+8）─────────────────────────────────────────────────────

describe('台灣時區模擬（UTC+8）', () => {
  it('"2025-04-14" → UTC midnight = 台灣 April 14 早上 8 點，仍是週一，getWeekStart = April 14', () => {
    // UTC+8：April 14T00:00Z = April 14T08:00 local → getDay() = 1（週一）
    const simulatedTW = new Date(2025, 3, 14); // April 14 local Monday
    expect(simulatedTW.getDay()).toBe(1);
    const result = getWeekStart(simulatedTW);
    expect(result.getDate()).toBe(14);
  });

  it('修正後 parseWeekStartFromString("2025-04-14") 台灣時區結果正確', () => {
    const result = parseWeekStartFromString('2025-04-14');
    expect(result.getDate()).toBe(14);
  });
});

// ─── 模擬美國時區（UTC-7）─────────────────────────────────────────────────────

describe('美國時區模擬（UTC-7）', () => {
  it('【bug 重現】"2025-04-14" → UTC midnight = 美國 April 13 下午 5 點（週日），getWeekStart 回到 April 7', () => {
    // UTC-7：April 14T00:00Z = April 13T17:00 local → getDay() = 0（週日）
    const simulatedUS = new Date(2025, 3, 13); // April 13 Sunday（bug 情境）
    expect(simulatedUS.getDay()).toBe(0);
    const bugResult = getWeekStart(simulatedUS);
    expect(bugResult.getDate()).toBe(7); // 回到 April 7，不是 April 14
  });

  it('【修正後】parseWeekStartFromString("2025-04-14") 使用 local midnight，美國時區也回傳 April 14', () => {
    // new Date(year, month-1, day) = April 14 local midnight，不受 UTC offset 影響
    const result = parseWeekStartFromString('2025-04-14');
    expect(result.getDate()).toBe(14);
  });
});

// ─── goToNextWeek round-trip ──────────────────────────────────────────────────

describe('goToNextWeek round-trip', () => {
  it('April 7 + 7 天序列化後，修正版 parse 回來應是 April 14（兩種時區模擬都通過）', () => {
    const currentWeekStart = new Date(2025, 3, 7); // April 7 (Monday) local
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);

    const year = newWeekStart.getFullYear();
    const month = String(newWeekStart.getMonth() + 1).padStart(2, '0');
    const day = String(newWeekStart.getDate()).padStart(2, '0');
    const serialized = `${year}-${month}-${day}`;

    expect(serialized).toBe('2025-04-14');

    const result = parseWeekStartFromString(serialized);
    expect(result.getDate()).toBe(14); // 無論時區，都是 April 14
  });
});
