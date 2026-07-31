import { describe, it, expect } from 'vitest';
import { buildEventStart, buildEventEnd } from './buildEventDateTime';

describe('buildEventStart', () => {
  it('沒有時段時，預設為當天 00:00:00', () => {
    const result = buildEventStart('2026-08-01', '');
    expect(result).toEqual({
      _seconds: Math.floor(new Date('2026-08-01T00:00:00').getTime() / 1000),
      _nanoseconds: 0,
    });
  });

  it('有時段時，使用實際時段', () => {
    const result = buildEventStart('2026-08-01', '14:00');
    expect(result).toEqual({
      _seconds: Math.floor(new Date('2026-08-01T14:00:00').getTime() / 1000),
      _nanoseconds: 0,
    });
  });
});

describe('buildEventEnd', () => {
  it('沒有時段時，預設為當天 23:59:59', () => {
    const result = buildEventEnd('2026-08-02', '');
    expect(result).toEqual({
      _seconds: Math.floor(new Date('2026-08-02T23:59:59').getTime() / 1000),
      _nanoseconds: 0,
    });
  });

  it('有時段時，使用實際時段', () => {
    const result = buildEventEnd('2026-08-02', '18:30');
    expect(result).toEqual({
      _seconds: Math.floor(new Date('2026-08-02T18:30:00').getTime() / 1000),
      _nanoseconds: 0,
    });
  });
});
