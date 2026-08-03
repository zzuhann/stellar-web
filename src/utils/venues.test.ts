import { describe, expect, it } from 'vitest';
import { deriveVenueRegions, parseVenueCapacity, parseVenuePage, parseVenueSort } from './venues';

describe('deriveVenueRegions', () => {
  it('依 REGIONS 的北到南順序回傳唯一地區，並在最前面加上「全部」', () => {
    const venues = [{ region: '高雄' }, { region: '台北' }, { region: '台北' }, { region: '台中' }];
    expect(deriveVenueRegions(venues)).toEqual(['全部', '台北', '台中', '高雄']);
  });

  it('不在 REGIONS 常數中的髒資料地區會被濾掉', () => {
    const venues = [{ region: '台北' }, { region: '未知地區' }];
    expect(deriveVenueRegions(venues)).toEqual(['全部', '台北']);
  });

  it('空陣列時仍回傳只含「全部」的陣列', () => {
    expect(deriveVenueRegions([])).toEqual(['全部']);
  });
});

describe('parseVenueSort', () => {
  it('合法值原樣回傳', () => {
    expect(parseVenueSort('eventCount')).toBe('eventCount');
    expect(parseVenueSort('newest')).toBe('newest');
  });

  it('不合法值 fallback 為預設值 eventCount', () => {
    expect(parseVenueSort('random')).toBe('eventCount');
    expect(parseVenueSort('')).toBe('eventCount');
  });
});

describe('parseVenueCapacity', () => {
  it('合法值原樣回傳', () => {
    expect(parseVenueCapacity('all')).toBe('all');
    expect(parseVenueCapacity('20以下')).toBe('20以下');
    expect(parseVenueCapacity('60以上')).toBe('60以上');
  });

  it('不合法值 fallback 為 all', () => {
    expect(parseVenueCapacity('999')).toBe('all');
    expect(parseVenueCapacity('')).toBe('all');
  });
});

describe('parseVenuePage', () => {
  it('正整數字串回傳對應數字', () => {
    expect(parseVenuePage('3')).toBe(3);
  });

  it('非正整數（0、負數、非數字字串）fallback 為 1', () => {
    expect(parseVenuePage('0')).toBe(1);
    expect(parseVenuePage('-1')).toBe(1);
    expect(parseVenuePage('abc')).toBe(1);
    expect(parseVenuePage('')).toBe(1);
  });
});
