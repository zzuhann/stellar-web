import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { VenueTag } from '@/types';
import { venueTagDictionaryFixture as dictionary } from '@/test/venueTagDictionary.fixture';
import {
  NO_DECORATE_CONDITION_TEXT,
  buildVenueConditionText,
  buildVenueFacilityRows,
  buildVenueUsageRows,
  formatCardTagLabel,
  formatConditionUntil,
  formatTagDate,
  getVisibleVenueTags,
  pickCardTags,
} from './venueTags';

const TODAY = '2026-10-15';
const t = (...slugs: string[]): VenueTag[] => slugs.map((slug) => ({ slug }));
// Builders expect pre-filtered tags, so every input goes through the same filter the page uses
const visible = (tags: VenueTag[]) => getVisibleVenueTags(tags, dictionary, TODAY);
const usageRows = (tags: VenueTag[]) => buildVenueUsageRows(visible(tags), TODAY);
const conditionText = (tags: VenueTag[]) => buildVenueConditionText(visible(tags), TODAY);
const facilityRows = (tags: VenueTag[]) => buildVenueFacilityRows(visible(tags), dictionary);

const ALL_CARD_RANKED = t(
  'free_venue',
  'no_min_guarantee',
  'goods_distribution',
  'early_setup',
  'beginner_friendly',
  'parcel_receiving',
  'custom_menu',
  'private_booking',
  'exhibition_space',
  'multi_space'
);

describe('TC-013 卡片挑 3 個標籤 pickCardTags', () => {
  it.each([
    {
      name: '全部 10 個有 cardRank 的標籤 → 代發、免場地費、可提前佈展',
      tags: ALL_CARD_RANKED,
      expected: ['goods_distribution', 'free_venue', 'early_setup'],
    },
    {
      name: '只有不上卡片的標籤 → []',
      tags: t('needs_guarantee', 'venue_fee', 'deposit', 'can_decorate', 'takeaway_shop'),
      expected: [],
    },
    {
      name: '只有外帶為主與展覽空間 → 展覽空間',
      tags: t('takeaway_shop', 'exhibition_space'),
      expected: ['exhibition_space'],
    },
    {
      name: '輸入順序打亂 → 結果仍照 cardRank',
      tags: [...ALL_CARD_RANKED].reverse(),
      expected: ['goods_distribution', 'free_venue', 'early_setup'],
    },
  ])('$name', ({ tags, expected }) => {
    expect(pickCardTags(visible(tags), dictionary).map((tag) => tag.slug)).toEqual(expected);
  });
});

describe('TC-014 三行用途 buildVenueUsageRows', () => {
  it.each([
    {
      name: '只有代發 → 發放行「店家可以代發」',
      tags: t('goods_distribution'),
      expected: [{ key: 'distribution', title: '發放應援物', description: '店家可以代發' }],
    },
    {
      name: '代發＋代收 → 補一句也可以代收',
      tags: t('goods_distribution', 'parcel_receiving'),
      expected: [
        {
          key: 'distribution',
          title: '發放應援物',
          description: '店家可以代發，也可以代收應援物',
        },
      ],
    },
    { name: '只有代收 → 沒有發放行', tags: t('parcel_receiving'), expected: [] },
    {
      name: 'can_decorate → 佈置行',
      tags: t('can_decorate'),
      expected: [{ key: 'decorate', title: '佈置、辦生咖' }],
    },
    {
      name: 'private_booking → 包場行只有標題',
      tags: t('private_booking'),
      expected: [{ key: 'privateBooking', title: '包場', description: null }],
    },
  ])('$name', ({ tags, expected }) => {
    const rows = usageRows(tags);
    expect(rows).toHaveLength(expected.length);
    expected.forEach((row, i) => expect(rows[i]).toMatchObject(row));
  });

  it('三行都有時順序固定為發放 → 佈置 → 包場（不受輸入順序影響）', () => {
    const rows = usageRows(t('private_booking', 'can_decorate', 'goods_distribution'));
    expect(rows.map((r) => r.key)).toEqual(['distribution', 'decorate', 'privateBooking']);
  });
});

describe('TC-015 條件文字 buildVenueConditionText', () => {
  it.each<{ name: string; tags: VenueTag[]; expected: string | null }>([
    {
      name: '七個來源全有（不含需場地費）',
      tags: [
        { slug: 'free_venue', limited: true, until: '2026-12-31' },
        ...t('needs_guarantee', 'deposit', 'no_min_guarantee', 'early_setup', 'display_fixtures'),
      ],
      expected:
        '2026/12/31 前免場地費・需達保底・需押金（活動後退還）・沒有杯數門檻・可提前佈展・有佈置設備',
    },
    {
      name: '免場地費限期無日期',
      tags: [{ slug: 'free_venue', limited: true }],
      expected: '限期免場地費',
    },
    { name: '免場地費不限期', tags: t('free_venue'), expected: '免場地費' },
    { name: '只有需場地費', tags: t('venue_fee'), expected: '需場地費' },
    {
      name: '免場地費（不限期）＋需場地費',
      tags: t('free_venue', 'venue_fee'),
      expected: '依方案免場地費或需場地費',
    },
    {
      name: '免場地費（至 2026-12-31）＋需場地費（決定 #7）',
      tags: [{ slug: 'free_venue', limited: true, until: '2026-12-31' }, ...t('venue_fee')],
      expected: '依方案免場地費（至 12/31）或需場地費',
    },
    {
      name: '合併句接在其他條件前面',
      tags: [...t('venue_fee', 'needs_guarantee', 'free_venue')],
      expected: '依方案免場地費或需場地費・需達保底',
    },
    {
      name: '免場地費 until 當天仍算',
      tags: [{ slug: 'free_venue', limited: true, until: '2026-10-15' }],
      expected: '2026/10/15 前免場地費',
    },
    {
      name: '免場地費 until 已過 → 不算進條件；全空回 null',
      tags: [{ slug: 'free_venue', limited: true, until: '2026-10-14' }, ...t('can_decorate')],
      expected: null,
    },
    {
      name: '非條件來源的標籤不進條件',
      tags: t('goods_distribution', 'cafe', 'projector', 'can_decorate'),
      expected: null,
    },
  ])('$name', ({ tags, expected }) => {
    expect(conditionText(tags)).toBe(expected);
  });

  it('條件全空時，佈置行改寫「佈置條件可詢問店家」', () => {
    const [row] = usageRows([
      { slug: 'free_venue', limited: true, until: '2026-10-14' },
      ...t('can_decorate'),
    ]);
    expect(NO_DECORATE_CONDITION_TEXT).toBe('佈置條件可詢問店家');
    expect(row).toMatchObject({
      key: 'decorate',
      description: NO_DECORATE_CONDITION_TEXT,
    });
  });

  it('有條件時佈置行帶條件文字', () => {
    const [row] = usageRows(t('can_decorate', 'needs_guarantee'));
    expect(row).toMatchObject({ description: '需達保底' });
  });

  it('輸出只由固定字串與日期組成（沒有金額、不吃 equipmentNote）', () => {
    const all = [
      { slug: 'free_venue', limited: true as const, until: '2026-12-31' },
      ...dictionary.tags.filter((d) => d.slug !== 'free_venue').map((d) => ({ slug: d.slug })),
    ];
    const text = conditionText(all) ?? '';
    expect(text).not.toMatch(/\$|元|NT/);
    expect(text).toBe(
      '依方案免場地費（至 12/31）或需場地費・需達保底・需押金（活動後退還）・沒有杯數門檻・可提前佈展・有佈置設備'
    );
  });
});

describe('TC-016 「服務、交通與空間」分列 buildVenueFacilityRows', () => {
  const allSlugs = dictionary.tags.map((d) => d.slug);

  it('四列依序為服務、交通、空間類型、設備，標籤照字典順序', () => {
    const rows = facilityRows(t(...allSlugs.slice().reverse()));
    expect(rows.map((r) => r.label)).toEqual(['服務', '交通', '空間類型', '設備']);
    expect(rows[0].tags.map((x) => x.label)).toEqual(['可提前佈展', '新手友善', '客製餐點']);
    expect(rows[1].tags.map((x) => x.label)).toEqual(['近捷運', '近火車站']);
    expect(rows[2].tags.map((x) => x.label)).toEqual([
      '咖啡廳',
      '展覽空間',
      '酒吧/餐酒館',
      '多功能空間',
      '外帶為主',
    ]);
    expect(rows[3].tags.map((x) => x.label)).toEqual(['投影/螢幕', '可播放音樂', '佈置設備']);
  });

  it('有代收但沒有代發時，代收放服務列', () => {
    const rows = facilityRows(t('parcel_receiving', 'beginner_friendly'));
    expect(rows).toEqual([
      {
        key: 'service',
        label: '服務',
        tags: [
          { slug: 'beginner_friendly', label: '新手友善' },
          { slug: 'parcel_receiving', label: '應援物代收' },
        ],
      },
    ]);
  });

  it('代發和代收都有時，代收不在服務列；用途行的代發、包場、可佈置與價格類不在這一區', () => {
    const rows = facilityRows(
      t('goods_distribution', 'parcel_receiving', 'private_booking', 'can_decorate', 'free_venue')
    );
    expect(rows).toEqual([]);
  });

  it('外帶為主在空間類型列；沒有標籤的列不顯示', () => {
    const rows = facilityRows(t('takeaway_shop'));
    expect(rows).toEqual([
      { key: 'space', label: '空間類型', tags: [{ slug: 'takeaway_shop', label: '外帶為主' }] },
    ]);
  });

  it('字典沒有的 slug 不顯示', () => {
    expect(facilityRows(t('unknown_tag'))).toEqual([]);
  });

  it('卡片上能出現的 10 個標籤，在用途行或這一區至少出現一次', () => {
    const tags = t(...allSlugs);
    const usageText = usageRows(tags)
      .map((r) => `${r.title} ${r.description ?? ''}`)
      .join(' ');
    const facilitySlugs = facilityRows(tags).flatMap((r) => r.tags.map((x) => x.slug));
    // Usage rows describe these with UX copy instead of the dictionary label
    const usageCopy: Record<string, string> = {
      goods_distribution: '店家可以代發',
      parcel_receiving: '也可以代收應援物',
      free_venue: '免場地費',
      no_min_guarantee: '沒有杯數門檻',
      private_booking: '包場',
    };
    const cardSlugs = dictionary.tags.filter((d) => d.cardRank).map((d) => d.slug);
    expect(cardSlugs).toHaveLength(10);
    for (const slug of cardSlugs) {
      const inUsage = usageCopy[slug] ? usageText.includes(usageCopy[slug]) : false;
      expect(inUsage || facilitySlugs.includes(slug), slug).toBe(true);
    }
  });
});

describe('builder 只吃 getVisibleVenueTags 的結果（型別保證）', () => {
  it('直接傳原始 VenueTag[] 會編譯失敗', () => {
    const raw: VenueTag[] = t('goods_distribution');
    // @ts-expect-error raw tags must go through getVisibleVenueTags first
    buildVenueUsageRows(raw, TODAY);
    // @ts-expect-error raw tags must go through getVisibleVenueTags first
    buildVenueConditionText(raw, TODAY);
    // @ts-expect-error raw tags must go through getVisibleVenueTags first
    buildVenueFacilityRows(raw, dictionary);
    expect(buildVenueUsageRows(visible(raw), TODAY)).toHaveLength(1);
  });
});

describe('getVisibleVenueTags（字典三種情況、過期）', () => {
  it('字典載入失敗（null）→ 當成沒有標籤', () => {
    expect(getVisibleVenueTags(t('goods_distribution'), null, TODAY)).toEqual([]);
  });

  it('標籤全部對不到字典 → 當成沒有標籤', () => {
    expect(getVisibleVenueTags(t('foo', 'baz'), dictionary, TODAY)).toEqual([]);
  });

  it('保留字典有的、until 未過的；欄位不存在當成空陣列', () => {
    const tags: VenueTag[] = [
      { slug: 'free_venue', limited: true, until: '2026-10-14' },
      { slug: 'cafe' },
      { slug: 'unknown' },
      { slug: 'deposit', limited: true },
    ];
    expect(getVisibleVenueTags(tags, dictionary, TODAY)).toEqual([
      { slug: 'cafe' },
      { slug: 'deposit', limited: true },
    ]);
    expect(getVisibleVenueTags(undefined, dictionary, TODAY)).toEqual([]);
  });
});

const ORIGINAL_TZ = process.env.TZ;

describe.each(['America/Los_Angeles', 'UTC'])('TC-032 日期 formatter（TZ=%s）', (tz) => {
  beforeAll(() => {
    process.env.TZ = tz;
  });
  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it('時區真的切換了（避免測試假通過）', () => {
    const offset = new Date(2026, 0, 1).getTimezoneOffset();
    expect(offset).toBe(tz === 'UTC' ? 0 : 480);
  });

  it.each([
    ['2026-10-15', '2026/10/15'],
    ['2026-01-05', '2026/1/5'],
    ['2026-12-31', '2026/12/31'],
  ])('資料更新日期 %s → %s', (input, expected) => {
    expect(formatTagDate(input)).toBe(expected);
  });

  it.each<[VenueTag, string]>([
    [{ slug: 'free_venue', limited: true, until: '2026-12-31' }, '免場地費・限期至 12/31'],
    [{ slug: 'free_venue', limited: true, until: '2027-01-31' }, '免場地費・限期至 2027/1/31'],
    [{ slug: 'free_venue', limited: true }, '免場地費（限期）'],
    [{ slug: 'free_venue' }, '免場地費'],
  ])('卡片限期 %j → %s', (tag, expected) => {
    expect(formatCardTagLabel(tag, '免場地費', TODAY)).toBe(expected);
  });

  it('條件文字日期：「2026/12/31 前」與合併句的「（至 12/31）」', () => {
    expect(conditionText([{ slug: 'free_venue', limited: true, until: '2026-12-31' }])).toBe(
      '2026/12/31 前免場地費'
    );
    expect(formatConditionUntil('2026-12-31', TODAY)).toBe('12/31');
    expect(formatConditionUntil('2027-01-31', TODAY)).toBe('2027/1/31');
  });
});
