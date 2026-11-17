import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ReservationSection from './ReservationSection';
import VerticalEventCard from '@/components/EventCardCarousel/VerticalEventCard';
import { eventsApi } from '@/lib/api';
import { sendGAEvent } from '@next/third-parties/google';
import type { CoffeeEvent, ReservationEventItem } from '@/types';

vi.mock('@/lib/api', () => ({
  eventsApi: { getReservations: vi.fn() },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const NOW = new Date('2026-11-20T04:00:00Z'); // Taipei 11/20 12:00

const ts = (iso: string) => ({
  _seconds: Math.floor(new Date(iso).getTime() / 1000),
  _nanoseconds: 0,
});

const makeEvent = (
  id: string,
  overrides: Partial<ReservationEventItem> = {}
): ReservationEventItem => ({
  id,
  slug: `slug-${id}`,
  title: `活動 ${id}`,
  datetime: { start: ts('2026-11-25T00:00:00Z'), end: ts('2026-11-30T00:00:00Z') },
  artists: [{ id: 'a1', name: '藝人甲' }],
  reservation: { url: 'https://example.com/reserve' },
  ...overrides,
});

// ids sort lexicographically so list order equals creation order
const makeEvents = (n: number) =>
  Array.from({ length: n }, (_, i) => makeEvent(`e${String(i + 1).padStart(2, '0')}`));

const getReservations = vi.mocked(eventsApi.getReservations);

const renderSection = (
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
) =>
  render(
    <QueryClientProvider client={client}>
      <ReservationSection />
    </QueryClientProvider>
  );

const TITLE = '預約中 / 即將開放';

// jsdom has no layout; Swiper derives slide counts and snap points from element sizes
beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = '.swiper-slide { width: 300px; }';
  document.head.appendChild(style);
  const size = (el: HTMLElement) => (el.classList.contains('swiper-slide') ? 300 : 332);
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return size(this);
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return size(this);
    },
  });
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('載入中 / 空 / 失敗 (TC-011, TC-012)', () => {
  it('TC-011 載入中顯示標題、提示、4 列骨架且 aria-busy', () => {
    getReservations.mockReturnValue(new Promise(() => {}));
    const { container } = renderSection();

    expect(screen.getByRole('heading', { name: TITLE })).toBeTruthy();
    expect(screen.getByText(/預約名額可能隨時額滿/)).toBeTruthy();
    expect(screen.getAllByTestId('reservation-skeleton-row')).toHaveLength(4);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it.each([
    ['0 筆', () => getReservations.mockResolvedValue({ events: [], total: 0 })],
    ['API 失敗', () => getReservations.mockRejectedValue(new Error('boom'))],
  ])('TC-012 %s：整個 section 不渲染', async (_name, setup) => {
    setup();
    const { container } = renderSection();

    await waitFor(() => expect(screen.queryByText(TITLE)).toBeNull());
    expect(screen.queryByText(/預約名額可能隨時額滿/)).toBeNull();
    expect(screen.queryAllByTestId('reservation-skeleton-row')).toHaveLength(0);
    expect(container.textContent).toBe('');
  });
});

describe('TC-026 領完為止', () => {
  it('untilGone 的列顯示「起・領完為止」，不顯示下架日', async () => {
    getReservations.mockResolvedValue({
      events: [makeEvent('ug', { untilGone: true })],
      total: 1,
    });
    renderSection();

    const row = await screen.findByRole('link', { name: /活動 ug/ });
    expect(within(row).getByText(/起・領完為止・藝人甲/)).toBeTruthy();
    expect(row.textContent).not.toMatch(/2026\/11\/30/);
  });
});

describe('背景重抓失敗', () => {
  it('已有資料時重抓失敗，版位保留', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    getReservations.mockResolvedValueOnce({ events: makeEvents(2), total: 2 });
    renderSection(client);
    await screen.findByRole('link', { name: /活動 e01/ });

    getReservations.mockRejectedValueOnce(new Error('boom'));
    await client.refetchQueries({ queryKey: ['reservation-events'] });

    await waitFor(() => expect(client.getQueryState(['reservation-events'])?.status).toBe('error'));
    expect(screen.getByRole('link', { name: /活動 e01/ })).toBeTruthy();
  });
});

describe('鍵盤焦點才換頁', () => {
  it('滑鼠按下露出的下一頁時不換頁', async () => {
    getReservations.mockResolvedValue({ events: makeEvents(8), total: 8 });
    const { container } = renderSection();
    await screen.findAllByRole('link');

    const second = container.querySelectorAll('.swiper-slide')[1] as HTMLElement;
    // jsdom does not match :focus-visible after a programmatic/mouse focus
    fireEvent.focus(within(second).getByRole('link', { name: /活動 e05/ }));
    expect(container.querySelector('.swiper-slide-active')).toBe(
      container.querySelectorAll('.swiper-slide')[0]
    );
  });
});

describe('連結 (TC-013, TC-014)', () => {
  it('TC-013 整列是連到 /event/[slug] 的 <a>', async () => {
    getReservations.mockResolvedValue({ events: [makeEvent('x', { slug: 'abc' })], total: 1 });
    renderSection();

    const link = await screen.findByRole('link', { name: /活動 x/ });
    expect(link.getAttribute('href')).toBe('/event/abc');
  });

  it('TC-014 slug 為 null 時退回 eventId，不出現 /event/null', async () => {
    getReservations.mockResolvedValue({
      events: [makeEvent('xyz', { slug: null })],
      total: 1,
    });
    renderSection();

    const link = await screen.findByRole('link', { name: /活動 xyz/ });
    expect(link.getAttribute('href')).toBe('/event/xyz');
  });
});

describe('分頁 (TC-015, TC-016)', () => {
  it.each([1, 4])('TC-015 %i 場只有一頁、沒有分頁點', async (n) => {
    getReservations.mockResolvedValue({ events: makeEvents(n), total: n });
    const { container } = renderSection();

    await screen.findAllByRole('link');
    expect(container.querySelectorAll('.swiper-slide')).toHaveLength(1);
    expect(container.querySelectorAll('.swiper-pagination-bullet')).toHaveLength(0);
  });

  it.each([
    [5, 2],
    [20, 5],
  ])('TC-016 %i 場分成 %i 頁，第 5 列在第 2 頁', async (n, pages) => {
    getReservations.mockResolvedValue({ events: makeEvents(n), total: n });
    const { container } = renderSection();

    await screen.findAllByRole('link');
    expect(container.querySelectorAll('.swiper-slide')).toHaveLength(pages);
    expect(container.querySelectorAll('.swiper-pagination-bullet')).toHaveLength(pages);

    const secondPage = container.querySelectorAll('.swiper-slide')[1] as HTMLElement;
    expect(within(secondPage).getByRole('link', { name: /活動 e05/ })).toBeTruthy();
    expect(within(secondPage).queryByRole('link', { name: /活動 e04/ })).toBeNull();
  });
});

describe('GA 事件 (TC-018, TC-019, TC-020)', () => {
  it('TC-018 點列送全清單位置，不是頁內位置', async () => {
    getReservations.mockResolvedValue({ events: makeEvents(8), total: 8 });
    renderSection();

    fireEvent.click(await screen.findByRole('link', { name: /活動 e05/ }));
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'click_reservation_section_event', {
      event_page: '/',
      user_id: 'user-1',
      content_id: 'e05',
      list_position: 5,
    });

    fireEvent.click(screen.getByRole('link', { name: /活動 e02/ }));
    expect(sendGAEvent).toHaveBeenLastCalledWith(
      'event',
      'click_reservation_section_event',
      expect.objectContaining({ content_id: 'e02', list_position: 2 })
    );
  });

  const pageViewCalls = () =>
    vi
      .mocked(sendGAEvent)
      .mock.calls.filter(([, name]) => name === 'view_reservation_section_page');

  it('TC-019 換頁送該頁第一列位置，同一頁只送一次', async () => {
    getReservations.mockResolvedValue({ events: makeEvents(12), total: 12 });
    const { container } = renderSection();
    await screen.findAllByRole('link');
    const bullets = () => container.querySelectorAll('.swiper-pagination-bullet');

    fireEvent.click(bullets()[1]);
    expect(pageViewCalls()).toHaveLength(1);
    expect(pageViewCalls()[0][2]).toEqual({
      event_page: '/',
      user_id: 'user-1',
      content_id: '',
      list_position: 5,
    });

    fireEvent.click(bullets()[2]);
    expect(pageViewCalls().map((c) => (c[2] as { list_position: number }).list_position)).toEqual([
      5, 9,
    ]);

    fireEvent.click(bullets()[1]);
    expect(pageViewCalls()).toHaveLength(2);
  });

  it('TC-020 初始化、resize、回到第 1 頁都不送 view 事件', async () => {
    getReservations.mockResolvedValue({ events: makeEvents(12), total: 12 });
    const { container } = renderSection();
    await screen.findAllByRole('link');

    fireEvent(window, new Event('resize'));
    expect(pageViewCalls()).toHaveLength(0);

    const bullets = container.querySelectorAll('.swiper-pagination-bullet');
    fireEvent.click(bullets[1]);
    fireEvent.click(bullets[0]);
    expect(pageViewCalls().map((c) => (c[2] as { list_position: number }).list_position)).toEqual([
      5,
    ]);
  });
});

describe('時間以載入當下為準 (TC-021)', () => {
  it('快取資料在時間推進後重新掛載，分組與收錄依當下時間重算', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    getReservations.mockResolvedValue({
      events: [
        // 開放時間與結束時間都在取得資料時的未來，之後會被時間推過
        makeEvent('opens-soon', {
          reservation: { url: 'https://x', startAt: ts('2026-11-20T04:30:00Z') },
        }),
        makeEvent('ends-soon', {
          datetime: { start: ts('2026-11-19T00:00:00Z'), end: ts('2026-11-20T04:30:00Z') },
        }),
        makeEvent('later', {
          reservation: { url: 'https://x', startAt: ts('2026-11-22T00:00:00Z') },
        }),
      ],
      total: 3,
    });

    const first = renderSection(client);
    await screen.findByRole('link', { name: /活動 opens-soon/ });
    expect(screen.getByText('11/20（五）12:30 開放預約')).toBeTruthy();
    expect(screen.getByRole('link', { name: /活動 ends-soon/ })).toBeTruthy();
    first.unmount();

    // 推進到 13:00 Taipei，資料仍在快取內（沒有重新請求）
    vi.setSystemTime(new Date('2026-11-20T05:00:00Z'));
    renderSection(client);
    await screen.findByRole('link', { name: /活動 opens-soon/ });

    expect(getReservations).toHaveBeenCalledTimes(1);
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/event/slug-later',
      '/event/slug-opens-soon',
    ]);
    expect(within(links[1]).getByText('已開放預約')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /活動 ends-soon/ })).toBeNull();
  });
});

describe('版位與熱門卡片共用狀態判斷 (TC-009)', () => {
  const trendingEvent = (reservation?: CoffeeEvent['reservation']): CoffeeEvent => ({
    id: 't1',
    slug: 't1',
    artists: [],
    title: '熱門活動',
    description: '',
    location: { name: '店', address: '地址', coordinates: { lat: 0, lng: 0 } },
    datetime: { start: ts('2026-11-25T00:00:00Z'), end: ts('2026-11-30T00:00:00Z') },
    socialMedia: {},
    status: 'approved',
    createdBy: 'u',
    createdAt: { _seconds: 0, _nanoseconds: 0 },
    updatedAt: { _seconds: 0, _nanoseconds: 0 },
    reservation,
  });

  it.each([
    ['2026-11-21T06:00:00Z', '11/21（六）14:00 開放預約', '11/21（六）14:00 開放預約'],
    ['2026-11-19T00:00:00Z', '已開放預約', '已開放預約'],
  ])('startAt=%s：版位「%s」、卡片「%s」', async (startAtIso, sectionText, cardText) => {
    getReservations.mockResolvedValue({
      events: [makeEvent('s1', { reservation: { url: 'https://x', startAt: ts(startAtIso) } })],
      total: 1,
    });
    renderSection();
    const row = await screen.findByRole('link', { name: /活動 s1/ });
    expect(within(row).getByText(sectionText)).toBeTruthy();
    cleanup();

    render(
      <VerticalEventCard event={trendingEvent({ url: 'https://x', startAt: ts(startAtIso) })} />
    );
    expect(screen.getByText(cardText)).toBeTruthy();
  });

  it.each([
    ['沒有 reservation', undefined],
    ['url 為空白', { url: '  ', startAt: ts('2026-11-21T06:00:00Z') }],
  ])('%s：熱門卡片不出現標籤', (_name, reservation) => {
    render(<VerticalEventCard event={trendingEvent(reservation)} />);
    expect(screen.queryByText(/開放預約|開放$/)).toBeNull();
  });

  it.each(['請私訊IG', 'www.foo.com', 'javascript:alert(1)'])(
    'TC-027 非 http(s) url %j：熱門卡片不出現標籤',
    (url) => {
      render(
        <VerticalEventCard event={trendingEvent({ url, startAt: ts('2026-11-21T06:00:00Z') })} />
      );
      expect(screen.queryByText(/開放預約|開放$/)).toBeNull();
    }
  );
});
