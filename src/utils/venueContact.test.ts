import { describe, expect, it } from 'vitest';
import type { VenueDetail } from '@/types';
import { buildVenueContact, type VenueContactSource } from './venueContact';

const base: VenueContactSource = {
  name: '月光咖啡',
  socialMedia: {},
  preferredContact: undefined,
  contactUrl: undefined,
  bookingFormUrl: null,
};
const venue = (overrides: Partial<VenueContactSource>): VenueContactSource => ({
  ...base,
  ...overrides,
});

describe('TC-096 新版聯絡管道判斷 buildVenueContact', () => {
  it.each<{
    name: string;
    input: VenueContactSource;
    expected: { channel: string; url: string; label: string } | null;
  }>([
    {
      name: 'instagram ＋ IG 帳號',
      input: venue({ preferredContact: 'instagram', socialMedia: { instagram: 'moon_cafe' } }),
      expected: {
        channel: 'instagram',
        url: 'https://www.instagram.com/moon_cafe',
        label: '私訊 月光咖啡（Instagram）',
      },
    },
    {
      name: 'threads ＋ Threads 帳號',
      input: venue({ preferredContact: 'threads', socialMedia: { threads: 'moon_cafe' } }),
      expected: {
        channel: 'threads',
        url: 'https://www.threads.com/@moon_cafe',
        label: '私訊 月光咖啡（Threads）',
      },
    },
    {
      name: 'line ＋ contactUrl',
      input: venue({ preferredContact: 'line', contactUrl: 'https://lin.ee/abc' }),
      expected: { channel: 'line', url: 'https://lin.ee/abc', label: '用 LINE 聯絡 月光咖啡' },
    },
    {
      name: 'IG 帳號帶 @ 與前後空白 → 用清理後的帳號',
      input: venue({ preferredContact: 'instagram', socialMedia: { instagram: '  @moon_cafe ' } }),
      expected: {
        channel: 'instagram',
        url: 'https://www.instagram.com/moon_cafe',
        label: '私訊 月光咖啡（Instagram）',
      },
    },
    {
      name: '舊資料 form → 改用 Instagram，不用 contactUrl',
      input: venue({
        preferredContact: 'form',
        contactUrl: 'https://forms.gle/x',
        socialMedia: { instagram: 'moon_cafe', threads: 'moon_t' },
      }),
      expected: {
        channel: 'instagram',
        url: 'https://www.instagram.com/moon_cafe',
        label: '私訊 月光咖啡（Instagram）',
      },
    },
    {
      name: '舊資料 other、沒有 IG → 改用 Threads',
      input: venue({
        preferredContact: 'other',
        contactUrl: 'https://example.com',
        socialMedia: { threads: 'moon_t' },
      }),
      expected: {
        channel: 'threads',
        url: 'https://www.threads.com/@moon_t',
        label: '私訊 月光咖啡（Threads）',
      },
    },
    {
      name: '舊資料 form、IG 和 Threads 都沒有 → null（contactUrl 一律不用）',
      input: venue({ preferredContact: 'form', contactUrl: 'https://forms.gle/x' }),
      expected: null,
    },
    {
      name: '沒有 preferredContact（極舊資料）→ 跟 form／other 一樣依序改用 Instagram、Threads',
      input: venue({ socialMedia: { threads: 'moon_t' } }),
      expected: {
        channel: 'threads',
        url: 'https://www.threads.com/@moon_t',
        label: '私訊 月光咖啡（Threads）',
      },
    },
    {
      name: '選 instagram 但只有 Threads → null，不改用 Threads',
      input: venue({ preferredContact: 'instagram', socialMedia: { threads: 'moon_t' } }),
      expected: null,
    },
    {
      name: '選 line 但沒有 contactUrl → null',
      input: venue({ preferredContact: 'line', socialMedia: { line: 'https://lin.ee/x' } }),
      expected: null,
    },
  ])('$name', ({ input, expected }) => {
    const result = buildVenueContact(input);
    if (expected === null) {
      expect(result).toBeNull();
      return;
    }
    expect(result).toMatchObject(expected);
    // contactType sent on click is the channel actually used
    expect(result?.contactType).toBe(expected.channel);
  });

  it('按鈕文字拆成前綴、店名、後綴，讓長店名截斷時管道名仍露出', () => {
    expect(
      buildVenueContact(venue({ preferredContact: 'threads', socialMedia: { threads: 'm' } }))
        ?.labelParts
    ).toEqual({ before: '私訊 ', name: '月光咖啡', after: '（Threads）' });
    expect(
      buildVenueContact(venue({ preferredContact: 'line', contactUrl: 'https://lin.ee/a' }))
        ?.labelParts
    ).toEqual({ before: '用 LINE 聯絡 ', name: '月光咖啡', after: '' });
  });

  it.each<[string, VenueDetail['bookingFormUrl'] | '  ', string | null]>([
    ['有值', 'https://forms.gle/book', 'https://forms.gle/book'],
    ['null', null, null],
    ['undefined', undefined, null],
    ['空字串', '', null],
    ['只有空白', '  ', null],
  ])('預約表單那一行：bookingFormUrl %s', (_, bookingFormUrl, expected) => {
    const result = buildVenueContact(
      venue({
        preferredContact: 'instagram',
        socialMedia: { instagram: 'moon_cafe' },
        bookingFormUrl,
      })
    );
    expect(result?.bookingFormUrl).toBe(expected);
  });

  it('聯絡判斷是 null 時，就算有 bookingFormUrl 也不出現（整個回 null）', () => {
    expect(buildVenueContact(venue({ bookingFormUrl: 'https://forms.gle/book' }))).toBeNull();
  });
});
