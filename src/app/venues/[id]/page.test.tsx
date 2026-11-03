import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import { notFound } from 'next/navigation';
import { venueApi } from '@/lib/api';
import type { VenueDetail } from '@/types';
import { venueTagDictionaryFixture } from '@/test/venueTagDictionary.fixture';
import { STELLAR_INSTAGRAM_URL, STELLAR_THREADS_URL } from '@/constants/stellarSocial';
import * as pageModule from './page';

const NOT_FOUND = new Error('NEXT_NOT_FOUND');

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw NOT_FOUND;
  }),
}));
vi.mock('@/lib/api', () => ({
  venueApi: {
    getVenueById: vi.fn(),
    getTagDictionary: vi.fn(),
    getVenues: vi.fn(),
    recordView: vi.fn(),
  },
}));

const VenueDetailPage = pageModule.default;

const venue: VenueDetail = {
  id: 'abc',
  name: '月光咖啡',
  address: '台北市中山區某路 1 號',
  region: '台北',
  lat: 25,
  lng: 121.5,
  placeId: 'place-1',
  nearestMrt: '中山站',
  mrtWalkMinutes: 5,
  capacityRange: '20-40',
  eventCount: 2,
  coverPhoto: null,
  description: '店家說明內文',
  otherPhotos: [],
  hostTags: ['老闆許願少女時代生咖'],
  status: 'active',
  socialMedia: { instagram: 'moon_cafe' },
  preferredContact: 'instagram',
  bookingFormUrl: 'https://forms.gle/book',
  tags: [{ slug: 'goods_distribution' }, { slug: 'can_decorate' }, { slug: 'cafe' }],
  sourceLinks: ['https://a.com', 'https://b.com', 'https://c.com'],
  equipmentNote: '投影機',
  infoUpdatedOn: '2026-10-15',
  events: [
    {
      id: 'e1',
      title: '進行中的生日應援',
      artistName: 'WONWOO',
      startDate: '2026-10-10',
      endDate: '2026-11-20',
      coverImage: '',
      slug: 'e1-slug',
      timeStatus: 'ongoing',
    },
    {
      id: 'e2',
      title: '沒有狀態的生日應援',
      artistName: 'WONWOO',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      coverImage: '',
      slug: 'e2-slug',
      timeStatus: null,
    },
  ],
};

const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(venueApi.getVenueById).mockResolvedValue(venue);
  vi.mocked(venueApi.getTagDictionary).mockResolvedValue(venueTagDictionaryFixture);
  vi.mocked(venueApi.getVenues).mockResolvedValue({
    venues: [],
    pagination: { page: 1, limit: 1000, total: 0, totalPages: 0 },
  } as never);
  vi.mocked(venueApi.recordView).mockResolvedValue(undefined as never);
});

afterEach(cleanup);

const renderPage = async (id = 'abc') => render(await VenueDetailPage(params(id)));

// Stops jsdom from trying to navigate on link clicks
const withoutNavigation = async (fn: () => Promise<void>) => {
  const preventNav = (e: Event) => e.preventDefault();
  document.addEventListener('click', preventNav);
  try {
    await fn();
  } finally {
    document.removeEventListener('click', preventNav);
  }
};

const gaCalls = (name: string) =>
  vi
    .mocked(sendGAEvent)
    .mock.calls.filter((c) => c[1] === name)
    .map((c) => c[2]);

describe('正式頁 /venues/[id] 換成新版', () => {
  it('維持 ISR：revalidate = 86400、有 generateStaticParams', async () => {
    expect(pageModule.revalidate).toBe(86400);
    expect(await pageModule.generateStaticParams()).toEqual([]);
  });

  it('metadata 的 SEO 文案不變（可被索引、canonical 是正式頁）', async () => {
    const metadata = await pageModule.generateMetadata(params('abc'));
    expect(metadata.title).toBe('月光咖啡 | 場地詳情');
    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe('https://www.stellar-zone.com/venues/abc');
  });

  it.each([
    [
      '捷運（transitStops 有捷運）→ 鄰近中山站',
      { transitStops: [{ type: 'mrt' as const, station: '中山', walkMinutes: 5 }] },
      '鄰近中山站',
    ],
    [
      '公車 → 鄰近公車 復興新和街口（不加「站」）',
      { transitStops: [{ type: 'bus' as const, station: '復興新和街口', walkMinutes: 3 }] },
      '鄰近公車 復興新和街口',
    ],
    ['舊資料（transitStops 不存在）→ 退回 nearestMrt', {}, '鄰近中山站'],
  ])('metadata 描述的交通跟頁首同一套規則：%s', async (_, overrides, expected) => {
    vi.mocked(venueApi.getVenueById).mockResolvedValue({ ...venue, ...overrides });
    const { description } = await pageModule.generateMetadata(params('abc'));
    expect(description).toContain(`，${expected}，可容納20-40人。`);
    expect(description).not.toMatch(/復興新和街口站/);
  });

  it('metadata：transitStops 是 [] 但 nearestMrt 還有舊值 → 描述不寫交通', async () => {
    vi.mocked(venueApi.getVenueById).mockResolvedValue({ ...venue, transitStops: [] });
    const { description } = await pageModule.generateMetadata(params('abc'));
    expect(description).not.toContain('鄰近');
    expect(description).toContain('生日應援場地，可容納20-40人。');
  });

  it('渲染新版版面、不顯示 hostTags，並記一次瀏覽數', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { level: 1, name: '月光咖啡' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '可以在這裡' })).toBeTruthy();
    expect(screen.getByText('進行中')).toBeTruthy();
    expect(screen.queryByText(/老闆許願少女時代生咖/)).toBeNull();
    expect(venueApi.recordView).toHaveBeenCalledWith('abc');
  });

  it('TC-094 字典請求失敗不讓整頁壞掉：隱藏標籤內容，聯絡、原始說明、設備原文照常', async () => {
    vi.mocked(venueApi.getTagDictionary).mockRejectedValue(new Error('500'));
    await renderPage();
    expect(screen.queryByRole('region', { name: '可以在這裡' })).toBeNull();
    expect(screen.getByText('投影機')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /店家原始說明/ })).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: /前往 月光咖啡 Instagram/ }).length).toBe(2);
  });

  it('不存在或下架（API 回 404）→ notFound()', async () => {
    vi.mocked(venueApi.getVenueById).mockRejectedValue({ response: { status: 404 } });
    await expect(VenueDetailPage(params('not-exist'))).rejects.toBe(NOT_FOUND);
    expect(notFound).toHaveBeenCalled();
  });

  it('其他錯誤丟給 error.tsx', async () => {
    const err = { response: { status: 500 } };
    vi.mocked(venueApi.getVenueById).mockRejectedValue(err);
    await expect(VenueDetailPage(params('abc'))).rejects.toBe(err);
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe('TC-025 詳情頁事件參數（真的點按鈕）', () => {
  const base = { event_page: '/venues/[id]', user_id: '', content_id: 'venue_abc' };

  it('聯絡按鈕與預約表單：contact_type 送實際管道／form，button_location 分 sticky_bar、side_card', async () => {
    await renderPage();
    const user = userEvent.setup();
    const bar = screen.getByRole('complementary', { name: '聯絡店家' });
    const card = screen.getByRole('region', { name: '聯絡場地' });

    await withoutNavigation(async () => {
      for (const container of [bar, card]) {
        const primary = within(container).getByRole('link', { name: /前往 月光咖啡/ });
        expect(primary.getAttribute('href')).toBe('https://www.instagram.com/moon_cafe');
        await user.click(primary);
        await user.click(within(container).getByRole('link', { name: '預約表單（開新分頁）' }));
      }
    });

    expect(gaCalls('click_venue_contact')).toEqual([
      { ...base, contact_type: 'instagram', button_location: 'sticky_bar' },
      { ...base, contact_type: 'form', button_location: 'sticky_bar' },
      { ...base, contact_type: 'instagram', button_location: 'side_card' },
      { ...base, contact_type: 'form', button_location: 'side_card' },
    ]);
  });

  it('click_venue_source_link：點第 2 個原始說明 → list_position 2', async () => {
    await renderPage();
    await withoutNavigation(async () => {
      await userEvent
        .setup()
        .click(screen.getByRole('link', { name: '店家原始說明 2（開新分頁）' }));
    });
    expect(gaCalls('click_venue_source_link')).toEqual([{ ...base, list_position: 2 }]);
  });

  it('click_venue_correction：聯絡表單、STELLAR IG、Threads 分別送 form／instagram／threads', async () => {
    await renderPage();
    const user = userEvent.setup();
    const form = screen.getByRole('link', { name: '聯絡表單' });
    const ig = screen.getByRole('link', { name: 'STELLAR IG（開新分頁）' });
    const threads = screen.getByRole('link', { name: 'Threads（開新分頁）' });
    expect([form, ig, threads].map((a) => a.getAttribute('href'))).toEqual([
      '/contact',
      STELLAR_INSTAGRAM_URL,
      STELLAR_THREADS_URL,
    ]);

    await withoutNavigation(async () => {
      for (const link of [form, ig, threads]) await user.click(link);
    });

    expect(gaCalls('click_venue_correction')).toEqual([
      { ...base, contact_type: 'form' },
      { ...base, contact_type: 'instagram' },
      { ...base, contact_type: 'threads' },
    ]);
  });

  it('click_event_detail：event_time_status 為 ongoing／空字串', async () => {
    await renderPage();
    const user = userEvent.setup();
    const posters = within(
      screen.getByRole('region', { name: '平台記錄的生咖、生日應援' })
    ).getAllByRole('listitem');

    await withoutNavigation(async () => {
      for (const poster of posters) await user.click(poster);
    });

    expect(gaCalls('click_event_detail')).toEqual([
      { event_page: '/venues/[id]', user_id: '', content_id: 'e1', event_time_status: 'ongoing' },
      { event_page: '/venues/[id]', user_id: '', content_id: 'e2', event_time_status: '' },
    ]);
  });

  it('舊資料 preferredContact: form、有 IG → 主要按鈕送 instagram（實際改用的管道），預約表單那一行照常', async () => {
    vi.mocked(venueApi.getVenueById).mockResolvedValue({
      ...venue,
      preferredContact: 'form',
      contactUrl: 'https://old-form.example.com',
    });
    await renderPage();
    const bar = screen.getByRole('complementary', { name: '聯絡店家' });
    const primary = within(bar).getByRole('link', { name: /前往 月光咖啡 Instagram/ });
    expect(primary.getAttribute('href')).toBe('https://www.instagram.com/moon_cafe');
    expect(within(bar).getByRole('link', { name: '預約表單（開新分頁）' })).toBeTruthy();

    await withoutNavigation(async () => {
      await userEvent.setup().click(primary);
    });

    expect(gaCalls('click_venue_contact')).toEqual([
      { ...base, contact_type: 'instagram', button_location: 'sticky_bar' },
    ]);
  });
});
