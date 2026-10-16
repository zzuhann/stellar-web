import { describe, expect, it } from 'vitest';
import { venueTagDictionaryFixture as dictionary } from '@/test/venueTagDictionary.fixture';
import { buildAdminVenuePreview, sameTags } from './adminVenueTagFields';

const TODAY = '2026-10-15';

describe('TC-033 後台右欄預覽的過期判斷跟後端一致', () => {
  const tagsWithFreeUntil = (until: string) => [
    { slug: 'free_venue', limited: true as const, until },
    { slug: 'goods_distribution' },
    { slug: 'early_setup' },
    { slug: 'beginner_friendly' },
    { slug: 'can_decorate' },
  ];

  it('until 是台灣今天（10-15）：卡片預覽與條件文字都有免場地費', () => {
    const preview = buildAdminVenuePreview(tagsWithFreeUntil('2026-10-15'), dictionary, TODAY);

    expect(preview.cardTagLabels).toEqual(['應援物代發', '免場地費・限期至 10/15', '可提前佈展']);
    expect(preview.usageRows.find((row) => row.key === 'decorate')?.description).toBe(
      '2026/10/15 前免場地費・可提前佈展'
    );
  });

  it('until 是昨天（10-14）：免場地費不出現，卡片由下一個標籤遞補', () => {
    const preview = buildAdminVenuePreview(tagsWithFreeUntil('2026-10-14'), dictionary, TODAY);

    expect(preview.cardTagLabels).toEqual(['應援物代發', '可提前佈展', '新手友善']);
    expect(preview.usageRows.find((row) => row.key === 'decorate')?.description).toBe('可提前佈展');
  });
});

describe('sameTags（TC-058 的 tags 比較）', () => {
  const a = { slug: 'free_venue' };
  const b = { slug: 'private_booking' };

  it.each([
    { name: '順序不同、集合相同 → 相同', left: [a, b], right: [b, a], expected: true },
    { name: '[a, b] 與 [a, a] → 不同', left: [a, b], right: [a, a], expected: false },
    {
      name: 'limited 不同 → 不同',
      left: [a],
      right: [{ slug: 'free_venue', limited: true as const }],
      expected: false,
    },
    {
      name: 'until 不同 → 不同',
      left: [{ slug: 'free_venue', limited: true as const, until: '2026-12-31' }],
      right: [{ slug: 'free_venue', limited: true as const, until: '2026-11-30' }],
      expected: false,
    },
  ])('$name', ({ left, right, expected }) => {
    expect(sameTags(left, right)).toBe(expected);
  });
});
