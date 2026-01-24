import { describe, it, expect } from 'vitest';
import {
  formatEventDate,
  formatDateRange,
  firebaseTimestampToDate,
  dateToLocalDateString,
} from './index';

describe('formatEventDate', () => {
  it('跨日活動：2026/1/27 - 2026/2/1', () => {
    const startDate = { _seconds: 1769443200, _nanoseconds: 0 };
    const endDate = { _seconds: 1769961599, _nanoseconds: 0 };
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2026/1/27 - 2026/2/1');
  });

  it('單日活動：同一天只顯示一次', () => {
    // 2026/1/27 00:00:00 到 2026/1/27 23:59:59
    const startDate = { _seconds: 1769443200, _nanoseconds: 0 };
    const endDate = { _seconds: 1769529599, _nanoseconds: 0 };
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2026/1/27');
  });

  it('跨月活動：2025/12/31 - 2026/1/2', () => {
    // 2025/12/31 到 2026/1/2
    const startDate = { _seconds: 1767110400, _nanoseconds: 0 }; // 2025/12/31
    const endDate = { _seconds: 1767369599, _nanoseconds: 0 }; // 2026/1/2
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2025/12/31 - 2026/1/2');
  });

  it('跨年活動：2025/12/24 - 2026/1/5', () => {
    const startDate = { _seconds: 1766505600, _nanoseconds: 0 }; // 2025/12/24
    const endDate = { _seconds: 1767628799, _nanoseconds: 0 }; // 2026/1/5
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2025/12/24 - 2026/1/5');
  });
});

describe('formatDateRange', () => {
  it('跨日活動（ISO string）：2026/1/27 - 2026/2/1', () => {
    const start = '2026-01-26T16:00:00.000Z';
    const end = '2026-02-01T15:59:59.000Z';
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/1/27 - 2026/2/1');
  });

  it('單日活動（ISO string）：同一天只顯示一次', () => {
    const start = '2026-01-26T16:00:00.000Z'; // 台灣 2026/1/27
    const end = '2026-01-27T15:59:59.000Z'; // 台灣 2026/1/27
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/1/27');
  });

  it('跨日活動（Date 物件）：2026/3/15 - 2026/3/20', () => {
    const start = new Date(2026, 2, 15); // 月份從 0 開始，2 = 3月
    const end = new Date(2026, 2, 20);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/3/15 - 2026/3/20');
  });

  it('單日活動（Date 物件）：同一天只顯示一次', () => {
    const start = new Date(2026, 4, 10); // 2026/5/10
    const end = new Date(2026, 4, 10);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/5/10');
  });

  it('跨月活動：2026/6/30 - 2026/7/5', () => {
    const start = new Date(2026, 5, 30);
    const end = new Date(2026, 6, 5);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/6/30 - 2026/7/5');
  });

  it('跨年活動：2026/12/28 - 2027/1/3', () => {
    const start = new Date(2026, 11, 28);
    const end = new Date(2027, 0, 3);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/12/28 - 2027/1/3');
  });
});

describe('firebaseTimestampToDate', () => {
  it('正確轉換 Firebase timestamp 為 Date', () => {
    const timestamp = { _seconds: 1769443200, _nanoseconds: 0 };
    const result = firebaseTimestampToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1769443200000);
  });

  it('處理含 nanoseconds 的 timestamp', () => {
    const timestamp = { _seconds: 1769443200, _nanoseconds: 500000000 };
    const result = firebaseTimestampToDate(timestamp);
    // 目前實作只使用 seconds，nanoseconds 被忽略
    expect(result.getTime()).toBe(1769443200000);
  });
});

describe('dateToLocalDateString', () => {
  it('正確轉換為 YYYY-MM-DD 格式（有補0）', () => {
    const date = new Date(2026, 0, 5); // 2026/1/5
    const result = dateToLocalDateString(date);
    expect(result).toBe('2026-01-05');
  });

  it('處理雙位數月份和日期', () => {
    const date = new Date(2026, 10, 15); // 2026/11/15
    const result = dateToLocalDateString(date);
    expect(result).toBe('2026-11-15');
  });
});
