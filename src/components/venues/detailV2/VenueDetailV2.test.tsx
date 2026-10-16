import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import type { VenueDetail, VenueTag, VenueTagDictionary } from '@/types';
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

const renderView = (
  venue: VenueDetail,
  opts: { dictionary?: VenueTagDictionary | null; analyticsEnabled?: boolean } = {}
) =>
  render(
    <VenueDetailV2
      venue={venue}
      relatedVenues={[]}
      dictionary={opts.dictionary === undefined ? dictionary : opts.dictionary}
      analyticsEnabled={opts.analyticsEnabled ?? false}
      today={TODAY}
    />
  );

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
      expect(within(container).getByText(/｜規則請以表單內說明為主/)).toBeTruthy();
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

describe('TC-085 元件層：analyticsEnabled=false 時不送任何自訂事件', () => {
  const venue = makeVenue({
    bookingFormUrl: 'https://forms.gle/book',
    sourceLinks: ['https://a.com', 'https://b.com'],
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
  });

  const clickEverything = async () => {
    const user = userEvent.setup();
    const preventNav = (e: Event) => e.preventDefault();
    document.addEventListener('click', preventNav);
    for (const name of [
      /前往 月光咖啡/,
      /預約表單/,
      /店家原始說明 2/,
      /聯絡表單/,
      /STELLAR IG/,
      /^Threads/,
    ]) {
      for (const link of screen.getAllByRole('link', { name })) await user.click(link);
    }
    const [poster] = within(
      screen.getByRole('region', { name: '平台記錄的生咖、生日應援' })
    ).getAllByRole('listitem');
    await user.click(poster);
    fireEvent(poster, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    document.removeEventListener('click', preventNav);
  };

  it('關閉時：聯絡、預約表單、原始說明、資料有誤、活動海報（含中鍵）都不送', async () => {
    renderView(venue, { analyticsEnabled: false });
    await clickEverything();
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it('開啟時（對照組）：聯絡按鈕送實際管道、預約表單送 form、活動海報照送', async () => {
    renderView(venue, { analyticsEnabled: true });
    await clickEverything();
    const calls = vi.mocked(sendGAEvent).mock.calls;
    const contactTypes = calls
      .filter((c) => c[1] === 'click_venue_contact')
      .map((c) => (c[2] as Record<string, string>).contact_type);
    expect(contactTypes).toEqual(['instagram', 'instagram', 'form', 'form']);
    expect(calls.filter((c) => c[1] === 'click_event_detail').length).toBeGreaterThan(0);
  });
});
