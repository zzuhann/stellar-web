import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import { notFound } from 'next/navigation';
import { venueApi } from '@/lib/api';
import type { VenueDetail } from '@/types';
import { venueTagDictionaryFixture } from '@/test/venueTagDictionary.fixture';
import { STELLAR_INSTAGRAM_URL } from '@/constants/stellarSocial';
import VenueDetailClient from '@/app/venues/[id]/VenueDetailClient';
import * as previewModule from './page';

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

const PreviewPage = previewModule.default;

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
  eventCount: 1,
  coverPhoto: null,
  description: '店家說明內文',
  otherPhotos: [],
  hostTags: ['老闆許願少女時代生咖'],
  status: 'active',
  socialMedia: { instagram: 'moon_cafe' },
  preferredContact: 'instagram',
  bookingFormUrl: 'https://forms.gle/book',
  tags: [{ slug: 'goods_distribution' }, { slug: 'can_decorate' }, { slug: 'cafe' }],
  sourceLinks: ['https://a.com', 'https://b.com'],
  equipmentNote: '投影機',
  infoUpdatedOn: '2026-10-15',
  events: [
    {
      id: 'e1',
      title: '生日應援',
      artistName: 'WONWOO',
      startDate: '2026-10-10',
      endDate: '2026-10-20',
      coverImage: '',
      slug: 'e1-slug',
      timeStatus: 'ongoing',
    },
  ],
};

const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.mocked(venueApi.getVenueById).mockResolvedValue(venue);
  vi.mocked(venueApi.getTagDictionary).mockResolvedValue(venueTagDictionaryFixture);
  vi.mocked(venueApi.getVenues).mockResolvedValue({
    venues: [],
    pagination: { page: 1, limit: 1000, total: 0, totalPages: 0 },
  } as never);
  vi.mocked(venueApi.recordView).mockResolvedValue(undefined as never);
});

afterEach(cleanup);

const renderPreview = async (id = 'abc') => render(await PreviewPage(params(id)));

describe('TC-020 預覽頁 metadata', () => {
  it('robots 為 noindex、nofollow；canonical 指向正式頁', async () => {
    const metadata = await previewModule.generateMetadata(params('abc'));
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('https://www.stellar-zone.com/venues/abc');
  });

  it('場地 API 失敗時 metadata 仍是 noindex', async () => {
    vi.mocked(venueApi.getVenueById).mockRejectedValue({ response: { status: 404 } });
    const metadata = await previewModule.generateMetadata(params('gone'));
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('https://www.stellar-zone.com/venues/gone');
  });

  it('動態渲染：沒有 revalidate、沒有 generateStaticParams', () => {
    const mod = previewModule as Record<string, unknown>;
    expect(mod.dynamic).toBe('force-dynamic');
    expect(mod.revalidate).toBeUndefined();
    expect(mod.generateStaticParams).toBeUndefined();
  });
});

describe('TC-021 預覽頁版面', () => {
  it('頁首上方有資訊框與「STELLAR IG」外部連結；新版版面元素齊全；不顯示 hostTags', async () => {
    await renderPreview();
    const notice = screen.getByRole('note');
    expect(notice.textContent).toContain(
      '這是新版場地頁的預覽，還沒有公開。標籤或條件跟你們的規定不一樣的話，私訊'
    );
    const ig = within(notice).getByRole('link', { name: 'STELLAR IG（開新分頁）' });
    expect(ig.getAttribute('href')).toBe(STELLAR_INSTAGRAM_URL);
    expect(ig.getAttribute('target')).toBe('_blank');
    // notice comes before the page heading
    expect(
      notice.compareDocumentPosition(screen.getByRole('heading', { level: 1 })) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(screen.getByRole('region', { name: '店家說明有提到' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '服務、交通與空間' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '平台記錄的生咖、生日應援' })).toBeTruthy();
    expect(screen.getByText('進行中')).toBeTruthy();
    expect(screen.getByText(/資料有誤或想更新？/)).toBeTruthy();
    expect(screen.queryByText(/老闆許願少女時代生咖/)).toBeNull();
  });

  it('字典請求失敗不讓整頁壞掉：照常渲染、隱藏標籤內容', async () => {
    vi.mocked(venueApi.getTagDictionary).mockRejectedValue(new Error('500'));
    await renderPreview();
    expect(screen.getByRole('heading', { level: 1, name: '月光咖啡' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: '店家說明有提到' })).toBeNull();
    expect(screen.getByText('投影機')).toBeTruthy();
  });
});

describe('TC-078 預覽頁的 404 與其他錯誤', () => {
  it('不存在或 inactive（API 回 404）→ notFound()', async () => {
    vi.mocked(venueApi.getVenueById).mockRejectedValue({ response: { status: 404 } });
    await expect(PreviewPage(params('not-exist'))).rejects.toBe(NOT_FOUND);
    expect(notFound).toHaveBeenCalled();
  });

  it('其他錯誤照正式頁一樣丟出（交給 error.tsx）', async () => {
    const err = { response: { status: 500 } };
    vi.mocked(venueApi.getVenueById).mockRejectedValue(err);
    await expect(PreviewPage(params('abc'))).rejects.toBe(err);
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe('TC-085 預覽頁不送自訂 GA 事件、不記瀏覽數', () => {
  const clickAll = async () => {
    const user = userEvent.setup();
    const preventNav = (e: Event) => e.preventDefault();
    document.addEventListener('click', preventNav);
    for (const name of [
      /私訊 月光咖啡/,
      /前往 Instagram 主頁/,
      /預約表單/,
      /店家原始說明/,
      /聯絡表單/,
      /STELLAR IG/,
    ]) {
      for (const link of screen.queryAllByRole('link', { name })) await user.click(link);
    }
    for (const poster of within(
      screen.getByRole('region', { name: '平台記錄的生咖、生日應援' })
    ).getAllByRole('listitem')) {
      await user.click(poster);
      fireEvent(poster, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    }
    document.removeEventListener('click', preventNav);
  };

  it('預覽頁：點聯絡、預約表單、原始說明、資料有誤、活動海報（含中鍵）→ sendGAEvent 0 次、沒有 POST /view', async () => {
    await renderPreview();
    await clickAll();
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(venueApi.recordView).not.toHaveBeenCalled();
  });

  it('對照組：正式頁同樣操作會送事件、會記瀏覽數', async () => {
    sessionStorage.clear();
    render(<VenueDetailClient venue={venue} relatedVenues={[]} />);
    await clickAll();
    const names = vi.mocked(sendGAEvent).mock.calls.map((c) => c[1]);
    expect(names).toContain('click_venue_contact');
    expect(names).toContain('click_event_detail');
    expect(venueApi.recordView).toHaveBeenCalledWith('abc');
  });
});
