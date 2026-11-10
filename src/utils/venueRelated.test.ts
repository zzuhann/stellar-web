import { describe, expect, it } from 'vitest';
import type { Venue, VenueTag, VenueTagDictionary } from '@/types';
import { venueTagDictionaryFixture as dictionary } from '@/test/venueTagDictionary.fixture';
import { buildRelatedVenues } from './venueRelated';

const TODAY = '2026-10-15';

const makeVenue = (id: string, region: string, tags: (string | VenueTag)[] = []): Venue => ({
  id,
  name: `店 ${id}`,
  address: `${region}某路`,
  region,
  lat: 0,
  lng: 0,
  nearestMrt: '中山站',
  mrtWalkMinutes: 5,
  capacityRange: '20-40',
  eventCount: 1,
  coverPhoto: null,
  status: 'active',
  tags: tags.map((x) => (typeof x === 'string' ? { slug: x } : x)),
});

// `count` other venues in another region that all carry the slug
const others = (slug: string, count: number, prefix = slug) =>
  Array.from({ length: count }, (_, i) => makeVenue(`${prefix}${i}`, '高雄', [slug]));

const run = (current: Venue, all: Venue[], dict: VenueTagDictionary | null = dictionary) =>
  buildRelatedVenues({
    venue: current,
    allVenues: [current, ...all],
    dictionary: dict,
    today: TODAY,
  });

describe('TC-001 照 cardRank 挑，不照陣列順序', () => {
  it('tags 反序也挑 cardRank 最小的', () => {
    const current = makeVenue('cur', '台北', ['custom_menu', 'free_venue', 'goods_distribution']);
    const all = [
      ...others('custom_menu', 3),
      ...others('free_venue', 3),
      ...others('goods_distribution', 3),
    ];
    const { tag } = run(current, all);
    expect(tag?.slug).toBe('goods_distribution');
    expect(tag?.label).toBe('應援物代發');
  });
});

describe('TC-002 第一個標籤不夠就往下退', () => {
  it('a：退到第二個標籤', () => {
    const current = makeVenue('cur', '台北', ['goods_distribution', 'free_venue']);
    const all = [...others('goods_distribution', 2), ...others('free_venue', 5)];
    expect(run(current, all).tag?.slug).toBe('free_venue');
  });

  it('b：可以退到第 4 個以後', () => {
    const current = makeVenue('cur', '台北', [
      'goods_distribution',
      'free_venue',
      'early_setup',
      'beginner_friendly',
    ]);
    const all = [
      ...others('goods_distribution', 2),
      ...others('free_venue', 2),
      ...others('early_setup', 2),
      ...others('beginner_friendly', 3),
    ];
    expect(run(current, all).tag?.slug).toBe('beginner_friendly');
  });
});

describe('TC-003 至少 3 家其他上架場地', () => {
  it.each([
    ['a：其他店剛好 2 家', 2, null],
    ['b：其他店剛好 3 家', 3, 'free_venue'],
  ])('%s', (_, count, expected) => {
    const current = makeVenue('cur', '台北', ['free_venue']);
    expect(run(current, others('free_venue', count)).tag?.slug ?? null).toBe(expected);
  });

  it('c：清單含目前這家，目前這家＋其他 2 家 → 不挑', () => {
    const current = makeVenue('cur', '台北', ['free_venue']);
    // run() already puts the current venue in the list
    expect(run(current, others('free_venue', 2)).tag).toBeNull();
  });
});

describe('TC-004 挑不出標籤', () => {
  const cases: [string, Venue, VenueTagDictionary | null][] = [
    ['a：只有非 cardRank 標籤', makeVenue('cur', '台北', ['can_decorate', 'cafe']), dictionary],
    ['b：tags 是空的', makeVenue('cur', '台北', []), dictionary],
    ['c：每個標籤其他店都不到 3 家', makeVenue('cur', '台北', ['free_venue']), dictionary],
    ['d：字典是 null', makeVenue('cur', '台北', ['free_venue']), null],
  ];
  it.each(cases)('%s → tag 是 null，地區那條照常', (_, current, dict) => {
    const all = [...others('free_venue', 2), ...others('can_decorate', 5), makeVenue('t1', '台北')];
    const result = run(current, all, dict);
    expect(result.tag).toBeNull();
    expect(result.region.map((v) => v.id)).toEqual(['t1']);
  });
});

describe('TC-005 過期標籤不拿來挑、也不拿來比對', () => {
  it.each([
    ['a：自己的 goods_distribution 昨天過期 → 挑 free_venue', '2026-10-14', 'free_venue'],
    ['b：今天是最後一天 → 仍有效', '2026-10-15', 'goods_distribution'],
  ])('%s', (_, until, expected) => {
    const current = makeVenue('cur', '台北', [{ slug: 'goods_distribution', until }, 'free_venue']);
    const all = [...others('goods_distribution', 3), ...others('free_venue', 3)];
    expect(run(current, all).tag?.slug).toBe(expected);
  });

  it.each([
    ['c：其他 4 家中 2 家過期 → 只剩 2 家，不挑', 2, null],
    ['d：其他 4 家中 1 家過期 → 3 家，挑且不含過期那家', 1, 'free_venue'],
  ])('%s', (_, expiredCount, expected) => {
    const current = makeVenue('cur', '台北', ['free_venue']);
    const all = [
      ...Array.from({ length: expiredCount }, (_x, i) =>
        makeVenue(`x${i}`, '高雄', [{ slug: 'free_venue', until: '2026-10-14' }])
      ),
      ...Array.from({ length: 4 - expiredCount }, (_x, i) =>
        makeVenue(`ok${i}`, '高雄', ['free_venue'])
      ),
    ];
    const result = run(current, all);
    expect(result.tag?.slug ?? null).toBe(expected);
    if (expected) expect(result.tag?.venues.some((v) => v.id.startsWith('x'))).toBe(false);
  });
});

describe('TC-006 同地區在前、保留 API 順序、最多 10 家、不含目前這家', () => {
  const tagged = (id: string, region: string) => makeVenue(id, region, ['free_venue']);

  it('12 家其他店、4 家台中', () => {
    const current = tagged('cur', '台中');
    const all = [
      tagged('B', '高雄'),
      tagged('A', '台中'),
      tagged('C', '高雄'),
      tagged('D', '台中'),
      current,
      tagged('E', '高雄'),
      tagged('F', '高雄'),
      tagged('G', '高雄'),
      tagged('H', '高雄'),
      tagged('I', '台中'),
      tagged('J', '台中'),
      tagged('K', '高雄'),
      tagged('L', '高雄'),
    ];
    const result = buildRelatedVenues({ venue: current, allVenues: all, dictionary, today: TODAY });
    const ids = result.tag?.venues.map((v) => v.id);
    expect(ids).toEqual(['A', 'D', 'I', 'J', 'B', 'C', 'E', 'F', 'G', 'H']);
    expect(ids).not.toContain('cur');
  });

  it('只有 [B, A, C, D] 時結果是 [A, D, B, C]', () => {
    const current = tagged('cur', '台中');
    const all = [
      tagged('B', '高雄'),
      tagged('A', '台中'),
      tagged('C', '高雄'),
      tagged('D', '台中'),
    ];
    expect(run(current, all).tag?.venues.map((v) => v.id)).toEqual(['A', 'D', 'B', 'C']);
  });
});

describe('TC-007 符合的店全部在其他地區', () => {
  it('照樣顯示，地區那條是空的', () => {
    const current = makeVenue('cur', '基隆', ['free_venue']);
    const result = run(current, others('free_venue', 3));
    expect(result.tag?.venues).toHaveLength(3);
    expect(result.region).toEqual([]);
  });
});

describe('TC-008 地區那條內容不變', () => {
  it('21 家台北店、不限 10 家、不含目前這家、順序同 API', () => {
    const current = makeVenue('cur', '台北');
    const taipei = Array.from({ length: 21 }, (_, i) => makeVenue(`tp${i}`, '台北'));
    const all = [...taipei.slice(0, 10), ...others('x', 19, 'o'), ...taipei.slice(10)];
    expect(run(current, all).region.map((v) => v.id)).toEqual(taipei.map((v) => v.id));
  });
});

describe('卡片只帶小卡片欄位', () => {
  it('不含 tags、otherPhotos 等', () => {
    const current = makeVenue('cur', '台北', ['free_venue']);
    const big = {
      ...makeVenue('big', '台北', ['free_venue']),
      otherPhotos: ['x'],
      hostTags: ['y'],
    };
    const result = run(current, [big]);
    expect(Object.keys(result.region[0]).sort()).toEqual(
      ['capacityRange', 'coverPhoto', 'eventCount', 'id', 'name', 'nearestMrt', 'region'].sort()
    );
  });
});
