import { describe, expect, it } from 'vitest';
import {
  createTransitRow,
  formatTransitHeader,
  formatTransitListItem,
  formatTransitStationName,
  getVenueHeaderTransit,
  mrtStation,
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
      '公車 市政府・步行 3 分鐘'
    );
    expect(formatTransitHeader({ type: 'train', station: '台中火車站', walkMinutes: null })).toBe(
      '台中火車站'
    );
  });

  it.each([
    ['後驛站3號出口', 1, '後驛站3號出口・步行 1 分鐘'],
    ['捷運市政府站4號', 3, '捷運市政府站4號・步行 3 分鐘'],
    ['中山站R9', 10, '中山站R9・步行 10 分鐘'],
    ['中山4號出口', 3, '中山4號出口・步行 3 分鐘'],
    ['雙連', 3, '雙連站步行 3 分鐘'],
  ])('捷運站名寫了出口：不再補「站」，步行前加「・」（%s）', (station, walkMinutes, expected) => {
    expect(formatTransitHeader({ type: 'mrt', station, walkMinutes })).toBe(expected);
  });
});

describe('TC-144 交通清單的每一筆 formatTransitListItem', () => {
  it.each([
    [{ type: 'bus', station: '復興新和街口', walkMinutes: 3 }, '公車 復興新和街口・步行 3 分鐘'],
    [{ type: 'mrt', station: '中山', walkMinutes: 5 }, '捷運 中山站・步行 5 分鐘'],
    [{ type: 'mrt', station: '中山站', walkMinutes: 5 }, '捷運 中山站・步行 5 分鐘'],
    [{ type: 'mrt', station: '捷運中山站', walkMinutes: null }, '捷運中山站'],
    [{ type: 'mrt', station: '古亭站7號出口', walkMinutes: 6 }, '捷運 古亭站7號出口・步行 6 分鐘'],
    [{ type: 'train', station: '台中火車站', walkMinutes: null }, '台中火車站'],
    [{ type: 'train', station: '台中火車站', walkMinutes: 8 }, '台中火車站・步行 8 分鐘'],
    [{ type: 'light_rail', station: '凱旋中華', walkMinutes: 2 }, '輕軌 凱旋中華・步行 2 分鐘'],
    [{ type: 'hsr', station: '高鐵台中站', walkMinutes: 10 }, '高鐵台中站・步行 10 分鐘'],
  ] as const)('%o → %s', (stop, expected) => {
    expect(formatTransitListItem(stop)).toBe(expected);
  });
});

describe('頁首與 metadata 共用的交通挑選 getVenueHeaderTransit（TC-141 規則）', () => {
  const legacy = { nearestMrt: '中山站', mrtWalkMinutes: 5 };

  it('transitStops 有值 → 照類型優先序挑一筆，不看舊欄位', () => {
    expect(
      getVenueHeaderTransit({
        ...legacy,
        transitStops: [
          { type: 'bus', station: '復興新和街口', walkMinutes: 3 },
          { type: 'train', station: '台中火車站', walkMinutes: 8 },
        ],
      })
    ).toEqual({ type: 'train', station: '台中火車站', walkMinutes: 8 });
  });

  it('transitStops 是 [] → null，就算舊欄位還有值也不退回', () => {
    expect(getVenueHeaderTransit({ ...legacy, transitStops: [] })).toBeNull();
  });

  it.each([null, undefined])('transitStops 是 %s → 退回舊欄位，當成捷運', (transitStops) => {
    expect(getVenueHeaderTransit({ ...legacy, transitStops })).toEqual({
      type: 'mrt',
      station: '中山站',
      walkMinutes: 5,
    });
    expect(
      getVenueHeaderTransit({ nearestMrt: null, mrtWalkMinutes: null, transitStops })
    ).toBeNull();
  });
});

describe('站名（不含步行分鐘）formatTransitStationName', () => {
  it.each([
    [{ type: 'mrt', station: '中山', walkMinutes: 5 }, '中山站'],
    [{ type: 'mrt', station: '中山站', walkMinutes: null }, '中山站'],
    [{ type: 'bus', station: '復興新和街口', walkMinutes: 3 }, '公車 復興新和街口'],
    [{ type: 'train', station: '台中火車站', walkMinutes: 8 }, '台中火車站'],
  ] as const)('%o → %s', (stop, expected) => {
    expect(formatTransitStationName(stop)).toBe(expected);
  });

  it('mrtStation：補一個「站」，站名裡已經有「站」就不補', () => {
    expect(mrtStation('中山')).toBe('中山站');
    expect(mrtStation('中山站')).toBe('中山站');
    expect(mrtStation('圓山捷運站1號出口')).toBe('圓山捷運站1號出口');
    expect(mrtStation('新埔民生站/新埔站')).toBe('新埔民生站/新埔站');
    expect(mrtStation('中山4號出口')).toBe('中山4號出口');
  });
});
