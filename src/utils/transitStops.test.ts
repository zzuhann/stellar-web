import { describe, expect, it } from 'vitest';
import {
  createTransitRow,
  formatTransitHeader,
  getTransitRowErrors,
  normalizeWalkMinutes,
  pickPrimaryTransit,
  sameTransitStops,
  toTransitStops,
  transitRowsFromVenue,
} from './transitStops';

describe('TC-110 步行分鐘的轉換順序（全形轉半形 → 濾掉非數字 → 取前 3 位）', () => {
  it.each([
    ['步行10分鐘', '10'],
    ['１０', '10'],
    ['約 15 分', '15'],
    ['０', '0'],
    ['1000', '100'],
    ['步行１２３４分', '123'],
    ['-5', '5'],
    ['abc', ''],
    // By the rule, not a bug: the dot is stripped
    ['1.5', '15'],
  ])('%j → %j', (input, expected) => {
    expect(normalizeWalkMinutes(input)).toBe(expected);
  });

  it('「abc」轉成空字串，送出時 walkMinutes 是 null', () => {
    const rows = [createTransitRow({ type: 'mrt', station: '中山', walkMinutes: '' })];
    expect(toTransitStops(rows)).toEqual([{ type: 'mrt', station: '中山', walkMinutes: null }]);
  });
});

describe('toTransitStops / getTransitRowErrors', () => {
  it('整列空白被丟掉；0 送成數字 0；站名 trim；照填的順序', () => {
    const rows = [
      createTransitRow({ type: 'mrt', station: ' 中山 ', walkMinutes: '0' }),
      createTransitRow(),
      createTransitRow({ type: 'bus', station: '市政府', walkMinutes: '999' }),
    ];
    expect(toTransitStops(rows)).toEqual([
      { type: 'mrt', station: '中山', walkMinutes: 0 },
      { type: 'bus', station: '市政府', walkMinutes: 999 },
    ]);
  });

  it('只填類型 →「請填站名」；只填站名 →「請選交通類型」；整列空白不報錯', () => {
    const typeOnly = createTransitRow({ type: 'mrt' });
    const stationOnly = createTransitRow({ station: '中山' });
    const blank = createTransitRow();
    const errors = getTransitRowErrors([typeOnly, stationOnly, blank]);
    expect(errors[typeOnly.id]).toEqual({ station: '請填站名' });
    expect(errors[stationOnly.id]).toEqual({ type: '請選交通類型' });
    expect(errors[blank.id]).toBeUndefined();
  });

  it('sameTransitStops 照順序逐欄比較', () => {
    const a = [{ type: 'mrt' as const, station: '中山', walkMinutes: 5 }];
    expect(sameTransitStops(a, [{ ...a[0] }])).toBe(true);
    expect(sameTransitStops(a, [{ ...a[0], walkMinutes: null }])).toBe(false);
    expect(sameTransitStops(a, [])).toBe(false);
  });
});

describe('transitRowsFromVenue（後台編輯預填，design-backend §10.5）', () => {
  it('transitStops 是 null：舊欄位預填成一列、類型留空', () => {
    const rows = transitRowsFromVenue({
      transitStops: null,
      nearestMrt: '中山站',
      mrtWalkMinutes: 5,
    });
    expect(rows.map(({ type, station, walkMinutes }) => ({ type, station, walkMinutes }))).toEqual([
      { type: '', station: '中山站', walkMinutes: '5' },
    ]);
  });

  it('transitStops 有值時照存的列；[] 時給一列空白', () => {
    expect(
      transitRowsFromVenue({
        transitStops: [{ type: 'bus', station: '市政府', walkMinutes: null }],
        nearestMrt: '中山站',
        mrtWalkMinutes: 5,
      }).map((r) => [r.type, r.station, r.walkMinutes])
    ).toEqual([['bus', '市政府', '']]);
    expect(
      transitRowsFromVenue({ transitStops: [], nearestMrt: '中山站', mrtWalkMinutes: 5 }).map(
        (r) => [r.type, r.station, r.walkMinutes]
      )
    ).toEqual([['', '', '']]);
  });
});

describe('TC-141 頁首交通挑選（類型優先序，同類型取最前面）', () => {
  it('捷運 → 輕軌 → 火車 → 高鐵 → 公車，不看陣列順序', () => {
    expect(
      pickPrimaryTransit([
        { type: 'bus', station: '市政府', walkMinutes: 2 },
        { type: 'mrt', station: '中山', walkMinutes: 5 },
        { type: 'mrt', station: '雙連', walkMinutes: 1 },
      ])
    ).toEqual({ type: 'mrt', station: '中山', walkMinutes: 5 });
    expect(pickPrimaryTransit([])).toBeNull();
  });

  it('捷運沿用舊格式；其他類型前面加類型字', () => {
    expect(formatTransitHeader({ type: 'mrt', station: '中山站', walkMinutes: 5 })).toBe(
      '中山站步行 5 分鐘'
    );
    expect(formatTransitHeader({ type: 'bus', station: '市政府', walkMinutes: 3 })).toBe(
      '公車 市政府，步行 3 分鐘'
    );
    expect(formatTransitHeader({ type: 'train', station: '台中火車站', walkMinutes: null })).toBe(
      '台中火車站'
    );
  });
});
