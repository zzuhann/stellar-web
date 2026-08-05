import { describe, it, expect } from 'vitest';
import { isValidTimeString, parseTimeString, formatTimeString, HOURS, MINUTES } from './utils';

describe('isValidTimeString', () => {
  it('接受合法的 HH:mm 字串', () => {
    expect(isValidTimeString('00:00')).toBe(true);
    expect(isValidTimeString('23:59')).toBe(true);
    expect(isValidTimeString('09:05')).toBe(true);
  });

  it('拒絕超出範圍的時間', () => {
    expect(isValidTimeString('24:00')).toBe(false);
    expect(isValidTimeString('12:60')).toBe(false);
  });

  it('拒絕空字串與格式錯誤的字串', () => {
    expect(isValidTimeString('')).toBe(false);
    expect(isValidTimeString('9:5')).toBe(false);
    expect(isValidTimeString('not-a-time')).toBe(false);
  });
});

describe('parseTimeString', () => {
  it('拆解合法字串為 hour/minute', () => {
    expect(parseTimeString('20:05')).toEqual({ hour: '20', minute: '05' });
  });

  it('空字串回傳空的 hour/minute', () => {
    expect(parseTimeString('')).toEqual({ hour: '', minute: '' });
  });

  it('不合法字串回傳空的 hour/minute', () => {
    expect(parseTimeString('25:99')).toEqual({ hour: '', minute: '' });
  });
});

describe('formatTimeString', () => {
  it('組合 hour/minute 為 HH:mm', () => {
    expect(formatTimeString('08', '05')).toBe('08:05');
  });
});

describe('HOURS / MINUTES', () => {
  it('HOURS 涵蓋 00 到 23', () => {
    expect(HOURS).toHaveLength(24);
    expect(HOURS[0]).toBe('00');
    expect(HOURS[23]).toBe('23');
  });

  it('MINUTES 涵蓋 00 到 59', () => {
    expect(MINUTES).toHaveLength(60);
    expect(MINUTES[0]).toBe('00');
    expect(MINUTES[59]).toBe('59');
  });
});
