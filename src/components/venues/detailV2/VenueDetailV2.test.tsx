import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import type { VenueDetail, VenueTag, VenueTagDictionary } from '@/types';
import type { RelatedVenueCard, RelatedTagStrip } from '@/utils/venueRelated';
import { venueTagDictionaryFixture as dictionary } from '@/test/venueTagDictionary.fixture';
import { STELLAR_INSTAGRAM_URL, STELLAR_THREADS_URL } from '@/constants/stellarSocial';
import VenueDetailV2 from './VenueDetailV2';

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null }) }));

afterEach(cleanup);

const TODAY = '2026-10-15';
const t = (...slugs: string[]): VenueTag[] => slugs.map((slug) => ({ slug }));

const makeVenue = (overrides: Partial<VenueDetail> = {}): VenueDetail => ({
  id: 'v1',
  name: '月光咖啡',
  address: '台北市中山區某路 1 號',
  region: '台北',
  lat: 25,
  lng: 121.5,
  placeId: 'place-1',
  nearestMrt: '中山站',
  mrtWalkMinutes: 5,
  capacityRange: '20-40',
  eventCount: 3,
  coverPhoto: 'https://cdn.stellar-zone.com/cover.jpg',
  description: '店家說明內文',
  otherPhotos: [],
  hostTags: ['老闆許願少女時代生咖'],
  status: 'active',
  socialMedia: { instagram: 'moon_cafe' },
  preferredContact: 'instagram',
  bookingFormUrl: null,
  tags: t('goods_distribution'),
  sourceLinks: [],
  equipmentNote: '',
  infoUpdatedOn: null,
  events: [],
  ...overrides,
});

interface RenderOpts {
  dictionary?: VenueTagDictionary | null;
  regionVenues?: RelatedVenueCard[];
  tagStrip?: RelatedTagStrip | null;
}

const renderView = (venue: VenueDetail, opts: RenderOpts = {}) =>
  render(
    <VenueDetailV2
      venue={venue}
      relatedRegionVenues={opts.regionVenues ?? []}
      relatedTagStrip={opts.tagStrip ?? null}
      dictionary={opts.dictionary === undefined ? dictionary : opts.dictionary}
      today={TODAY}
    />
  );

const card = (id: string, region = '台北', name = `店 ${id}`): RelatedVenueCard => ({
  id,
  name,
  coverPhoto: null,
  region,
  nearestMrt: '中山站',
  capacityRange: '20-40',
  eventCount: 0,
});

const gaCalls = (name: string) =>
  vi
    .mocked(sendGAEvent)
    .mock.calls.filter((c) => c[1] === name)
    .map((c) => c[2]);

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

const usageRegion = () => screen.queryByRole('region', { name: '可以在這裡' });
const getUsageRegion = () => screen.getByRole('region', { name: '可以在這裡' });
const facilityRegion = () => screen.queryByRole('region', { name: '服務、交通與空間' });
const getFacilityRegion = () => screen.getByRole('region', { name: '服務、交通與空間' });
const descriptionRegion = () => screen.getByRole('region', { name: '店家說明' });
const contactBar = () => screen.queryByRole('complementary', { name: '聯絡店家' });
const getContactBar = () => screen.getByRole('complementary', { name: '聯絡店家' });
const contactCard = () => screen.getByRole('region', { name: '聯絡場地' });

describe('TC-017 原始說明連結與資料更新日期', () => {
  it('連結 0 個 → 不顯示；日期 null → 不顯示；兩句固定文字照樣出現', () => {
    renderView(makeVenue({ sourceLinks: [], infoUpdatedOn: null }));
    const region = getUsageRegion();
    expect(within(region).queryByRole('link', { name: /店家原始說明/ })).toBeNull();
    expect(within(region).queryByText(/STELLAR 整理於/)).toBeNull();
    expect(within(region).getByText('沒列出的項目，也可以詢問店家討論。')).toBeTruthy();
    expect(within(region).getByText('費用依方案而定，以店家最新說明、私訊討論為準。')).toBeTruthy();
  });

  it('連結 1 個 → 「店家原始說明」，新分頁＋sr-only；有日期 → 「STELLAR 整理於」加 formatter 輸出', () => {
    renderView(
      makeVenue({ sourceLinks: ['https://example.com/rule.pdf'], infoUpdatedOn: '2026-10-15' })
    );
    const region = getUsageRegion();
    const link = within(region).getByRole('link', { name: '店家原始說明（開新分頁）' });
    expect(link.getAttribute('href')).toBe('https://example.com/rule.pdf');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(within(region).getByText('STELLAR 整理於 2026/10/15')).toBeTruthy();
  });

  it('連結 3 個 → 「店家原始說明 1」到「3」，都開新分頁', () => {
    const links = ['https://a.com', 'https://b.com', 'https://c.com'];
    renderView(makeVenue({ sourceLinks: links }));
    const region = getUsageRegion();
    links.forEach((href, i) => {
      const link = within(region).getByRole('link', { name: `店家原始說明 ${i + 1}（開新分頁）` });
      expect(link.getAttribute('href')).toBe(href);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });
});

describe('TC-034 完全沒有標籤', () => {
  it('a：有連結和日期 → 沒有兩個標籤區，連結和日期放在「店家說明」標題下方；其他照常', () => {
    renderView(
      makeVenue({
        tags: [],
        sourceLinks: ['https://example.com/rule.pdf'],
        infoUpdatedOn: '2026-10-15',
        events: [
          {
            id: 'e1',
            title: '生日應援',
            artistName: 'WONWOO',
            startDate: '2026-10-10',
            endDate: '2026-10-20',
            coverImage: '',
            slug: null,
            timeStatus: 'ongoing',
          },
        ],
      })
    );
    expect(usageRegion()).toBeNull();
    expect(facilityRegion()).toBeNull();
    const desc = descriptionRegion();
    expect(within(desc).getByRole('link', { name: '店家原始說明（開新分頁）' })).toBeTruthy();
    expect(within(desc).getByText('STELLAR 整理於 2026/10/15')).toBeTruthy();
    expect(within(desc).getByText('店家說明內文')).toBeTruthy();

    expect(screen.getByRole('heading', { level: 1, name: '月光咖啡' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /台北市中山區某路 1 號/ }).length).toBeGreaterThan(
      0
    );
    expect(screen.getByRole('region', { name: '平台記錄的生咖、生日應援' })).toBeTruthy();
    expect(contactBar()).toBeTruthy();
  });

  it('b：沒有連結也沒有日期 → 不出現那一行', () => {
    renderView(makeVenue({ tags: [], sourceLinks: [], infoUpdatedOn: null }));
    expect(usageRegion()).toBeNull();
    expect(facilityRegion()).toBeNull();
    expect(screen.queryByRole('link', { name: /店家原始說明/ })).toBeNull();
    expect(screen.queryByText(/STELLAR 整理於/)).toBeNull();
  });
});

describe('TC-035 有標籤但三行用途都沒有', () => {
  it('只有 cafe、near_mrt → 沒有空框，「服務、交通與空間」只有交通、空間類型兩列', () => {
    renderView(
      makeVenue({
        tags: t('cafe', 'near_mrt'),
        sourceLinks: ['https://a.com'],
        infoUpdatedOn: '2026-10-15',
      })
    );
    expect(usageRegion()).toBeNull();
    const region = getFacilityRegion();
    expect(
      within(region)
        .getAllByRole('term')
        .map((el) => el.textContent)
    ).toEqual(['交通', '空間類型']);
    expect(within(region).getByText('近捷運')).toBeTruthy();
    expect(within(region).getByText('咖啡廳')).toBeTruthy();
    // links and date fall back under the description heading, same as no tags
    expect(within(descriptionRegion()).getByText('STELLAR 整理於 2026/10/15')).toBeTruthy();
  });
});

// The bar is sticky in normal flow, so it must come after the last line of the page
const expectBarAfterLastLine = () => {
  const lastLine = screen.getByText(/資料有誤、想更新相關資訊/);
  expect(
    lastLine.compareDocumentPosition(getContactBar()) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
};

describe('頁首地區與捷運', () => {
  const headerLines = () =>
    Array.from(
      screen.getByRole('heading', { level: 1 }).parentElement?.querySelectorAll('p') ?? []
    ).map((p) => p.textContent);

  it('region 只有空白、也沒有捷運 → 地區 tag 和整行都不渲染', () => {
    renderView(makeVenue({ region: '   ', nearestMrt: null, capacityRange: '20-40' }));
    expect(headerLines()).toEqual(['容納 20-40人']);
  });

  it('region 是空字串但有捷運 → 只顯示捷運文字', () => {
    renderView(
      makeVenue({ region: '', nearestMrt: '中山站', mrtWalkMinutes: 5, capacityRange: null })
    );
    expect(headerLines()).toEqual(['中山站步行 5 分鐘']);
  });
});

describe('TC-141 新版詳情頁的交通退回規則', () => {
  const headerLines = () =>
    Array.from(
      screen.getByRole('heading', { level: 1 }).parentElement?.querySelectorAll('p') ?? []
    ).map((p) => p.textContent);

  it('a：transitStops 是 null → 退回舊欄位「中山站步行 5 分鐘」', () => {
    renderView(
      makeVenue({
        region: '',
        transitStops: null,
        nearestMrt: '中山站',
        mrtWalkMinutes: 5,
        capacityRange: null,
      })
    );
    expect(headerLines()).toEqual(['中山站步行 5 分鐘']);
  });

  it('b：transitStops 是 []、nearestMrt 卻有值 → 不顯示交通、不退回', () => {
    renderView(
      makeVenue({
        region: '',
        transitStops: [],
        nearestMrt: '中山站',
        mrtWalkMinutes: 5,
        capacityRange: null,
      })
    );
    expect(headerLines()).toEqual([]);
  });

  it('有交通欄位時讀新欄位，照類型優先序挑一筆', () => {
    renderView(
      makeVenue({
        region: '',
        capacityRange: null,
        nearestMrt: '舊站',
        transitStops: [
          { type: 'bus', station: '市政府', walkMinutes: 2 },
          { type: 'mrt', station: '中山', walkMinutes: 5 },
        ],
      })
    );
    expect(headerLines()).toEqual(['中山站步行 5 分鐘']);
  });
});

describe('TC-037 聯絡區的三種狀態', () => {
  const igVenue = {
    preferredContact: 'instagram' as const,
    socialMedia: { instagram: 'moon_cafe' },
  };

  it('a：有私訊管道、沒有 bookingFormUrl → 固定列與聯絡卡各一顆主要按鈕，沒有預約表單', () => {
    renderView(makeVenue({ ...igVenue, bookingFormUrl: null }));
    for (const container of [getContactBar(), contactCard()]) {
      const links = within(container).getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0].getAttribute('aria-label')).toBe('前往 月光咖啡 Instagram（開新分頁）');
      expect(links[0].getAttribute('href')).toBe('https://www.instagram.com/moon_cafe');
      expect(within(container).queryByText(/預約表單/)).toBeNull();
    }
    expectBarAfterLastLine();
  });

  it('b：有 bookingFormUrl → 按鈕下方「預約表單｜規則請以表單內說明為主」，手機和桌機都有', () => {
    renderView(makeVenue({ ...igVenue, bookingFormUrl: 'https://forms.gle/book' }));
    for (const container of [getContactBar(), contactCard()]) {
      const primary = within(container).getAllByRole('link', { name: /前往 月光咖啡/ });
      expect(primary).toHaveLength(1);
      const form = within(container).getByRole('link', { name: '預約表單（開新分頁）' });
      expect(form.getAttribute('href')).toBe('https://forms.gle/book');
      expect(form.getAttribute('target')).toBe('_blank');
      expect(within(container).getByText('規則請以表單內說明為主')).toBeTruthy();
      // the separator wraps with the link, never onto the hint's line
      expect(form.parentElement?.textContent).toBe('預約表單（開新分頁）｜');
    }
    expectBarAfterLastLine();
  });

  it.each([null, 'https://forms.gle/book'])(
    'c：沒有任何聯絡管道（bookingFormUrl=%s）→ 沒有固定列與 padding，聯絡卡改說明文字、也沒有預約表單',
    (bookingFormUrl) => {
      renderView(
        makeVenue({
          preferredContact: 'form',
          contactUrl: 'https://x.com',
          socialMedia: {},
          bookingFormUrl,
        })
      );
      expect(contactBar()).toBeNull();
      const card = contactCard();
      expect(within(card).getByText('這家還沒提供聯絡方式，可以先看店家原始說明。')).toBeTruthy();
      expect(within(card).queryAllByRole('link')).toHaveLength(0);
      expect(screen.queryByRole('link', { name: /預約表單/ })).toBeNull();
    }
  );

  it('長店名：完整文字放 aria-label，括號裡的管道名獨立一段不參與截斷', () => {
    const name = '非常非常非常非常非常非常長的咖啡廳名字';
    renderView(makeVenue({ ...igVenue, name }));
    const link = within(getContactBar()).getByRole('link');
    expect(link.getAttribute('aria-label')).toBe(`前往 ${name} Instagram（開新分頁）`);
    expect(within(link).getByText(name).getAttribute('data-part')).toBe('name');
    expect(within(link).getByText('Instagram').getAttribute('data-part')).toBe('channel');
  });
});

describe('TC-038 「店家提供的設備」原文', () => {
  it('a：equipmentNote 空字串 → 不顯示小框', () => {
    renderView(makeVenue({ tags: t('cafe'), equipmentNote: '' }));
    expect(screen.queryByText('店家提供的設備')).toBeNull();
  });

  it('b：多行含價格 → 全文保留換行，後接提醒；價格只在小框，不在用途行與條件文字', () => {
    const note = '扭蛋機\n燈板租借 $300';
    renderView(
      makeVenue({
        tags: t('goods_distribution', 'can_decorate', 'needs_guarantee', 'cafe'),
        equipmentNote: note,
      })
    );
    const box = screen.getByRole('region', { name: '店家提供的設備' });
    expect(
      within(box).getByText((_, el) => el?.textContent === note && el.tagName === 'P')
    ).toBeTruthy();
    expect(within(box).getByText('可能隨時變動，以店家說明為準。')).toBeTruthy();
    expect(screen.getAllByText(/\$300/)).toHaveLength(1);
    expect(getUsageRegion().textContent).not.toContain('$300');
    expect(within(getUsageRegion()).getByText('需達保底')).toBeTruthy();
  });
  it('原文前後的空行要去掉，中間的換行保留', () => {
    renderView(makeVenue({ tags: t('cafe'), equipmentNote: '\n\n投影機\n' }));
    const box = screen.getByRole('region', { name: '店家提供的設備' });
    expect(within(box).getByText('投影機').textContent).toBe('投影機');
  });

  it('沒有標籤列、只有設備原文時也去掉前後空行', () => {
    renderView(makeVenue({ tags: [], equipmentNote: '\n\n扭蛋機\n燈板\n' }));
    const box = screen.getByRole('region', { name: '店家提供的設備' });
    expect(
      within(box).getByText(
        (_, el) => el?.tagName === 'P' && el.textContent?.startsWith('扭蛋機') === true
      ).textContent
    ).toBe('扭蛋機\n燈板');
  });
});

describe('TC-094 前台字典載入失敗', () => {
  const venue = makeVenue({
    tags: t('goods_distribution', 'can_decorate', 'cafe', 'near_mrt'),
    sourceLinks: ['https://example.com/rule.pdf'],
    infoUpdatedOn: '2026-10-15',
    equipmentNote: '投影機免費',
    bookingFormUrl: 'https://forms.gle/book',
  });

  it('字典 null → 沒有三行用途與標籤列、不顯示錯誤；連結日期改放店家說明下方，設備、聯絡、預約表單照常', () => {
    renderView(venue, { dictionary: null });
    expect(usageRegion()).toBeNull();
    expect(screen.queryAllByRole('term')).toHaveLength(0);
    expect(screen.queryByText(/失敗|錯誤|重新整理/)).toBeNull();

    const desc = descriptionRegion();
    expect(within(desc).getByRole('link', { name: '店家原始說明（開新分頁）' })).toBeTruthy();
    expect(within(desc).getByText('STELLAR 整理於 2026/10/15')).toBeTruthy();
    expect(screen.getByText('投影機免費')).toBeTruthy();

    const primary = within(getContactBar()).getByRole('link', { name: /前往 月光咖啡/ });
    expect(primary.getAttribute('href')).toBe('https://www.instagram.com/moon_cafe');
    expect(
      within(getContactBar()).getByRole('link', { name: '預約表單（開新分頁）' })
    ).toBeTruthy();
  });

  it('字典成功但標籤全部對不到 → 當成沒有標籤', () => {
    renderView(makeVenue({ tags: t('unknown_a', 'unknown_b'), sourceLinks: ['https://a.com'] }));
    expect(usageRegion()).toBeNull();
    expect(facilityRegion()).toBeNull();
    expect(within(descriptionRegion()).getByRole('link', { name: /店家原始說明/ })).toBeTruthy();
  });

  it('字典成功有資料 → 用途行與標籤列出現（對照組）', () => {
    renderView(venue);
    expect(within(getUsageRegion()).getByText('發放應援物')).toBeTruthy();
    expect(within(getFacilityRegion()).getByText('咖啡廳')).toBeTruthy();
  });
});

describe('AC-6 不顯示 hostTags', () => {
  it('hostTags 的文字不出現在新版頁面', () => {
    renderView(makeVenue());
    expect(screen.queryByText(/老闆許願少女時代生咖/)).toBeNull();
  });
});

describe('店家說明收合（手機 4 行）', () => {
  it('不到 4 行 → 沒有「展開全部」', () => {
    renderView(makeVenue());
    expect(screen.queryByRole('button', { name: /展開全部/ })).toBeNull();
  });

  it('超過 4 行 → 出現「展開全部」，aria-expanded 隨點擊切換', async () => {
    const scroll = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(200);
    const client = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(96);
    renderView(makeVenue({ description: '很長的說明\n'.repeat(10) }));
    const button = screen.getByRole('button', { name: '展開全部' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await userEvent.setup().click(button);
    expect(screen.getByRole('button', { name: '收合' }).getAttribute('aria-expanded')).toBe('true');
    scroll.mockRestore();
    client.mockRestore();
  });
});

describe('資料有誤、想更新相關資訊', () => {
  it('「聯絡表單」連到 /contact，「STELLAR IG」「Threads」外部連結開新分頁', () => {
    renderView(makeVenue());
    expect(screen.getByRole('link', { name: '聯絡表單' }).getAttribute('href')).toBe('/contact');
    const ig = screen.getByRole('link', { name: 'STELLAR IG（開新分頁）' });
    expect(ig.getAttribute('href')).toBe(STELLAR_INSTAGRAM_URL);
    expect(ig.getAttribute('target')).toBe('_blank');
    const threads = screen.getByRole('link', { name: 'Threads（開新分頁）' });
    expect(threads.getAttribute('href')).toBe(STELLAR_THREADS_URL);
    expect(threads.getAttribute('target')).toBe('_blank');
  });
});

describe('TC-144 「服務、交通與空間」的交通清單', () => {
  const stops = [
    { type: 'bus' as const, station: '復興新和街口', walkMinutes: 3 },
    { type: 'mrt' as const, station: '中山', walkMinutes: 5 },
    { type: 'train' as const, station: '台中火車站', walkMinutes: null },
  ];
  const transitItems = () => {
    const region = getFacilityRegion();
    expect(
      within(region)
        .getAllByRole('term')
        .map((el) => el.textContent)
    ).toEqual(['交通']);
    return within(region)
      .getAllByRole('listitem')
      .map((li) => li.textContent);
  };

  it('a：有 transitStops → 交通列一行一筆、照填的順序，不出現「近捷運」標籤', () => {
    renderView(makeVenue({ tags: t('near_mrt'), transitStops: stops }));
    expect(transitItems()).toEqual([
      '公車 復興新和街口・步行 3 分鐘',
      '捷運 中山站・步行 5 分鐘',
      '台中火車站',
    ]);
    expect(within(getFacilityRegion()).queryByText('近捷運')).toBeNull();
  });

  it.each([null, []])(
    'b：transitStops 是 %o → 交通列照舊顯示「近捷運」，不從 nearestMrt 組清單',
    (transitStops) => {
      renderView(makeVenue({ tags: t('near_mrt'), transitStops, nearestMrt: '中山站' }));
      const region = getFacilityRegion();
      expect(within(region).getByText('近捷運')).toBeTruthy();
      expect(within(region).queryAllByRole('listitem')).toHaveLength(0);
    }
  );

  it.each([
    ['字典載入失敗', { dictionary: null }, t('near_mrt', 'cafe')],
    ['完全沒有標籤', {}, []],
  ] as const)('c：%s → 「服務、交通與空間」照樣出現，只有交通列的清單', (_, opts, tags) => {
    renderView(makeVenue({ tags: [...tags], transitStops: stops }), opts);
    const region = getFacilityRegion();
    expect(
      within(region)
        .getAllByRole('term')
        .map((el) => el.textContent)
    ).toEqual(['交通']);
    expect(within(region).getAllByRole('listitem')).toHaveLength(3);
  });
});

describe('單一 DOM：地址地圖、照片不在手機流與桌機右欄各 render 一份', () => {
  it('地址連結與地圖 iframe 各只有一份', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY', 'test-key');
    renderView(makeVenue());
    expect(screen.getAllByRole('link', { name: /台北市中山區某路 1 號/ })).toHaveLength(1);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(screen.getAllByRole('region', { name: '社群與地址' })).toHaveLength(1);
    vi.unstubAllEnvs();
  });

  it('沒有照片 → 空狀態只出現一次', () => {
    renderView(makeVenue({ coverPhoto: null, otherPhotos: [] }));
    expect(screen.getAllByText('店家尚未提供場地照片')).toHaveLength(1);
  });
});

describe('TC-145 元件層：「查看全部 N 張照片」只在 6 張以上出現', () => {
  // The mobile carousel scrolls its thumbnail strip on mount; jsdom has no scrollTo
  beforeAll(() => {
    Element.prototype.scrollTo = vi.fn();
  });

  const photosVenue = (count: number) =>
    makeVenue({
      coverPhoto: 'https://cdn.stellar-zone.com/p0.jpg',
      otherPhotos: Array.from(
        { length: count - 1 },
        (_, i) => `https://cdn.stellar-zone.com/p${i + 1}.jpg`
      ),
    });

  it('5 張沒有；6 張有「查看全部 6 張照片」', () => {
    renderView(photosVenue(5));
    expect(screen.queryByRole('button', { name: /查看全部/ })).toBeNull();
    cleanup();
    renderView(photosVenue(6));
    expect(screen.getByRole('button', { name: '查看全部 6 張照片' })).toBeTruthy();
  });

  it('桌機格子每一格都是可以按的按鈕，只排前 5 張', () => {
    renderView(photosVenue(7));
    // jsdom ignores CSS, so the mobile carousel's slides render too; scope to the grid
    const grid = screen.getByRole('button', { name: '查看全部 7 張照片' })
      .parentElement as HTMLElement;
    expect(within(grid).getAllByRole('button', { name: /^放大檢視第 \d+ 張照片$/ })).toHaveLength(
      5
    );
  });
});

describe('相關場地區：沒有同地區場地時改放「查看全部場地」', () => {
  it('地區那條是空的 → 「查看全部場地」連到 /venues', () => {
    renderView(makeVenue());
    expect(screen.getByRole('link', { name: '查看全部場地' }).getAttribute('href')).toBe('/venues');
  });

  it('有相關場地 → 顯示相關場地，不出現「查看全部場地」', () => {
    renderView(makeVenue(), { regionVenues: [card('v2', '台北', '星光咖啡')] });
    expect(screen.getByText('星光咖啡')).toBeTruthy();
    expect(screen.queryByRole('link', { name: '查看全部場地' })).toBeNull();
  });
});

describe('同標籤推薦的畫面', () => {
  const tagStrip: RelatedTagStrip = {
    slug: 'goods_distribution',
    label: '應援物代發',
    venues: [card('t1', '台北'), card('t2', '台中'), card('t3', '高雄')],
  };
  const regionVenues = [card('r1', '台北'), card('r2', '台北')];

  it('TC-011 標題、aria-label、位置、卡片連結與地區行', () => {
    renderView(makeVenue(), { regionVenues, tagStrip });
    const tagSection = screen.getByRole('region', { name: '也有「應援物代發」的場地' });
    expect(
      within(tagSection).getByRole('heading', { level: 2, name: '也有「應援物代發」的場地' })
    ).toBeTruthy();
    expect(within(tagSection).queryByRole('link', { name: '查看全部' })).toBeNull();

    const regionSection = screen.getByRole('region', { name: '台北的其他場地' });
    expect(
      regionSection.compareDocumentPosition(tagSection) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    const items = within(tagSection).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(
      within(tagSection)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href'))
    ).toEqual(['/venues/t1', '/venues/t2', '/venues/t3']);
    // Region line with an aria-hidden pin icon, same-region venue included
    expect(
      within(items[0]).getByText('台北').querySelector('svg[aria-hidden="true"]')
    ).toBeTruthy();
    expect(within(items[1]).getByText('台中')).toBeTruthy();
    // Region strip cards do not repeat the region
    expect(within(regionSection).queryByText('台北', { selector: 'div' })).toBeNull();
  });

  it('TC-012 地區那條的「查看全部」帶地區', () => {
    renderView(makeVenue(), { regionVenues });
    const section = screen.getByRole('region', { name: '台北的其他場地' });
    expect(within(section).getByRole('link', { name: '查看全部' }).getAttribute('href')).toBe(
      '/venues?region=%E5%8F%B0%E5%8C%97'
    );
  });

  it('TC-013 地區那條是空的、同標籤有 → 按鈕留在原位，同標籤那條在它下面', () => {
    renderView(makeVenue(), { tagStrip });
    const button = screen.getByRole('link', { name: '查看全部場地' });
    expect(button.getAttribute('href')).toBe('/venues');
    const tagSection = screen.getByRole('region', { name: '也有「應援物代發」的場地' });
    expect(
      button.compareDocumentPosition(tagSection) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('TC-004 畫面：沒有同標籤推薦 → 沒有標題也沒有空的 section', () => {
    renderView(makeVenue(), { regionVenues });
    expect(screen.queryByText(/^也有「/)).toBeNull();
    expect(screen.getAllByRole('region', { name: /的其他場地$/ })).toHaveLength(1);
  });

  it('TC-014 鍵盤：Tab 依序進入同標籤每張卡片，Enter 送一次 click_related_venue', async () => {
    vi.mocked(sendGAEvent).mockClear();
    renderView(makeVenue({ id: 'abc' }), { regionVenues, tagStrip });
    const user = userEvent.setup();
    const regionLinks = within(screen.getByRole('region', { name: '台北的其他場地' })).getAllByRole(
      'link'
    );
    const last = regionLinks[regionLinks.length - 1];
    last.focus();
    const tagLinks = within(
      screen.getByRole('region', { name: '也有「應援物代發」的場地' })
    ).getAllByRole('link');
    for (const link of tagLinks) {
      await user.tab();
      expect(document.activeElement).toBe(link);
    }
    tagLinks[0].focus();
    await withoutNavigation(async () => {
      await user.keyboard('{Enter}');
    });
    expect(gaCalls('click_related_venue')).toEqual([
      {
        event_page: '/venues/[id]',
        user_id: '',
        content_id: 'venue_t1',
        placement: 'related_tag',
        list_position: 1,
        venue_region: '台北',
        tag_slug: 'goods_distribution',
        related_strips: 'both',
      },
    ]);
  });
});

describe('價格列與文案', () => {
  it('TC-015 render a：不限期免場地費＋新手友善 → 價格列在服務上面，只有免場地費、不帶日期', () => {
    renderView(makeVenue({ tags: t('free_venue', 'beginner_friendly') }));
    const region = getFacilityRegion();
    const terms = within(region)
      .getAllByRole('term')
      .map((el) => el.textContent);
    expect(terms.slice(0, 2)).toEqual(['價格', '服務']);
    const priceTags = within(region).getByText('價格').nextElementSibling as HTMLElement;
    expect(priceTags.textContent).toBe('免場地費');
    expect(priceTags.children).toHaveLength(1);
    expect(within(region).queryByText(/\d+\/\d+/)).toBeNull();
  });

  it('TC-015 render e：免場地費在「服務」上面，標籤不帶日期；條件文字不變', () => {
    renderView(
      makeVenue({
        tags: [
          { slug: 'free_venue', limited: true, until: '2026-12-31' },
          { slug: 'venue_fee' },
          { slug: 'can_decorate' },
          { slug: 'beginner_friendly' },
        ],
      })
    );
    const region = getFacilityRegion();
    const terms = within(region)
      .getAllByRole('term')
      .map((el) => el.textContent);
    expect(terms.slice(0, 2)).toEqual(['價格', '服務']);
    expect(within(region).getByText('免場地費')).toBeTruthy();
    expect(within(getUsageRegion()).getByText('依方案免場地費（至 12/31）或需場地費')).toBeTruthy();
  });

  it('TC-015 render：沒有 free_venue 就沒有價格列', () => {
    renderView(makeVenue({ tags: t('cafe') }));
    expect(within(getFacilityRegion()).queryByText('價格')).toBeNull();
  });

  it('TC-016 render：「可以在這裡」是「辦生咖」，整頁沒有「佈置、辦生咖」', () => {
    renderView(makeVenue({ tags: t('can_decorate') }));
    expect(within(getUsageRegion()).getByText('辦生咖')).toBeTruthy();
    expect(screen.queryByText('佈置、辦生咖')).toBeNull();
  });
});

describe('標籤點擊事件', () => {
  const base = { event_page: '/venues/[id]', user_id: '', content_id: 'venue_abc' };
  beforeEach(() => vi.mocked(sendGAEvent).mockClear());

  it('TC-020 用途列：整個 li 都算點擊範圍，載入與 rerender 不送', async () => {
    const venue = makeVenue({
      id: 'abc',
      tags: t('goods_distribution', 'parcel_receiving', 'can_decorate', 'private_booking'),
    });
    const { rerender } = renderView(venue);
    rerender(
      <VenueDetailV2
        venue={venue}
        relatedRegionVenues={[]}
        relatedTagStrip={null}
        dictionary={dictionary}
        today={TODAY}
      />
    );
    expect(gaCalls('click_venue_tag')).toHaveLength(0);

    const user = userEvent.setup();
    const region = getUsageRegion();
    await user.click(within(region).getByText('店家可以代發，也可以代收應援物'));
    const decorateLi = within(region).getByText('辦生咖').closest('li') as HTMLElement;
    await user.click(decorateLi.querySelector('svg') as SVGElement);
    await user.click(within(region).getByText('包場'));

    expect(gaCalls('click_venue_tag')).toEqual([
      { ...base, tag_slug: 'goods_distribution', placement: 'usage_summary' },
      { ...base, tag_slug: 'can_decorate', placement: 'usage_summary' },
      { ...base, tag_slug: 'private_booking', placement: 'usage_summary' },
    ]);
  });

  it('TC-021 「服務、交通與空間」的標籤（含價格列）送 facilities', async () => {
    const { container } = renderView(
      makeVenue({ id: 'abc', tags: t('free_venue', 'beginner_friendly', 'cafe', 'near_mrt') })
    );
    const region = getFacilityRegion();
    const htmlBefore = container.innerHTML;
    const hrefBefore = window.location.href;
    const user = userEvent.setup();
    for (const label of ['免場地費', '新手友善', '咖啡廳', '近捷運']) {
      await user.click(within(region).getByText(label));
    }
    expect(gaCalls('click_venue_tag')).toEqual(
      ['free_venue', 'beginner_friendly', 'cafe', 'near_mrt'].map((slug) => ({
        ...base,
        tag_slug: slug,
        placement: 'facilities',
      }))
    );
    // Nothing changes on screen and the page does not navigate
    expect(container.innerHTML).toBe(htmlBefore);
    expect(window.location.href).toBe(hrefBefore);
  });

  it('TC-022 不該送的地方完全不送，原始說明連結只送 click_venue_source_link', async () => {
    renderView(
      makeVenue({
        id: 'abc',
        tags: t('goods_distribution', 'beginner_friendly', 'free_venue'),
        transitStops: [{ type: 'mrt', station: '中山', walkMinutes: 5 }],
        equipmentNote: '投影機',
        sourceLinks: ['https://a.com', 'https://b.com'],
      })
    );
    const usage = getUsageRegion();
    const facility = getFacilityRegion();
    const targets = [
      within(usage).getByRole('heading', { name: '可以在這裡' }),
      within(usage).getByText('沒列出的項目，也可以詢問店家討論。'),
      within(usage).getByText('費用依方案而定，以店家最新說明、私訊討論為準。'),
      within(facility).getByText('服務'),
      within(facility).getByText('價格'),
      within(facility).getByText(/中山/),
      within(facility).getByText('店家提供的設備').parentElement as HTMLElement,
    ];
    const user = userEvent.setup();
    await withoutNavigation(async () => {
      for (const el of targets) await user.click(el);
      await user.click(within(usage).getByRole('link', { name: '店家原始說明 2（開新分頁）' }));
    });
    expect(gaCalls('click_venue_tag')).toEqual([]);
    expect(gaCalls('click_venue_source_link')).toEqual([{ ...base, list_position: 2 }]);
  });

  it('TC-023 標籤與用途列維持不可互動', async () => {
    renderView(
      makeVenue({ tags: t('goods_distribution', 'free_venue', 'beginner_friendly', 'cafe') }),
      { regionVenues: [], tagStrip: null }
    );
    const usageItems = within(getUsageRegion()).getAllByRole('listitem');
    const tagEls = ['免場地費', '新手友善', '咖啡廳'].map((l) =>
      within(getFacilityRegion()).getByText(l)
    );
    for (const el of [...usageItems, ...tagEls]) {
      expect(el.getAttribute('role')).toBeNull();
      expect(el.hasAttribute('tabindex')).toBe(false);
      expect(['BUTTON', 'A']).not.toContain(el.tagName);
    }
    const user = userEvent.setup();
    const focusable = new Set<Element>();
    for (let i = 0; i < 40; i++) {
      await user.tab();
      focusable.add(document.activeElement as Element);
    }
    for (const el of [...usageItems, ...tagEls]) expect(focusable.has(el)).toBe(false);
  });
});
