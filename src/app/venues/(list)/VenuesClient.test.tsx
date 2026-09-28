import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import { venueApi } from '@/lib/api';
import { trackClickVenueDetail, trackSortVenues, trackViewVenueCard } from '@/lib/analytics/venues';
import VenuesClient from './VenuesClient';

// jsdom does not implement ResizeObserver; VenueFilters (rendered by VenuesClient) only
// uses it to toggle the region row's scroll fade indicators, not under test here.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

// VenueCard (rendered for real, not mocked, so list_sort wiring is exercised end-to-end)
// fires its view-card tracking from an IntersectionObserver callback. jsdom has none.
class ImmediateIntersectionObserverStub {
  private callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
}
vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserverStub);

// ─── next/navigation mock（比照 useQueryStateContext.test.tsx 的既有 pattern）───

function createSearchParamsMock(entries: [string, string][]) {
  return {
    get: (key: string) => entries.find(([k]) => k === key)?.[1] ?? null,
    forEach: (cb: (value: string, key: string) => void) => {
      entries.forEach(([key, value]) => cb(value, key));
    },
    toString: () => entries.map(([k, v]) => `${k}=${v}`).join('&'),
  };
}

let currentSearchParams = createSearchParamsMock([]);
function setMockSearchParams(entries: [string, string][]) {
  currentSearchParams = createSearchParamsMock(entries);
}

vi.mock('next/navigation', () => ({
  useSearchParams: () => currentSearchParams,
  usePathname: () => '/venues',
}));

vi.mock('@/lib/api', () => ({
  venueApi: { getVenues: vi.fn() },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@/hooks/usePageView', () => ({
  usePageView: () => {},
}));

vi.mock('@/lib/analytics/venues', () => ({
  trackFilterVenues: vi.fn(),
  trackSortVenues: vi.fn(),
  trackViewVenueCard: vi.fn(),
  trackClickVenueDetail: vi.fn(),
  toVenueContentId: (id: string) => `venue_${id}`,
}));

const EMPTY_RESPONSE = {
  venues: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

const VENUE_FIXTURE = {
  id: 'venue-1',
  name: '測試場地',
  address: '台北市測試路 1 號',
  region: '台北',
  lat: 25,
  lng: 121,
  nearestMrt: null,
  mrtWalkMinutes: null,
  capacityRange: '20-40' as const,
  eventCount: 3,
  coverPhoto: null,
  status: 'active' as const,
};

function oneVenueResponse() {
  return {
    venues: [VENUE_FIXTURE],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };
}

function renderVenuesClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <QueryStateProvider>
        <VenuesClient regions={['全部', '台北']} />
      </QueryStateProvider>
    </QueryClientProvider>
  );
}

const getSortTrigger = () => screen.getByRole('button', { name: '排序' });

async function openSortMenu() {
  fireEvent.click(getSortTrigger());
  return await screen.findByRole('menu');
}

let historyReplaceSpy: ReturnType<typeof vi.spyOn>;
let historyPushSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  setMockSearchParams([]);
  vi.mocked(venueApi.getVenues).mockReset();
  vi.mocked(venueApi.getVenues).mockResolvedValue(EMPTY_RESPONSE);
  historyReplaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  historyPushSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── Dropdown UI 與 URL 對應 ────────────────────────────────────────────────

describe('VenuesClient 排序 dropdown 與 URL 對應（Phase 2.8）', () => {
  it('未帶 sort 參數時，dropdown trigger 顯示「綜合排序」為選中狀態', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    const selected = within(menu).getByRole('menuitemradio', { name: /綜合排序/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
  });

  it('選擇「最新上架」→ URL 更新為 ?sort=newest，trigger 文案同步更新', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
    expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').get('sort')).toBe('newest');
    expect(screen.getByText('最新上架')).toBeTruthy();
  });

  it('選擇「生咖數最多」→ URL 更新為 ?sort=eventCount', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /生咖數最多/ }));

    const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
    expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').get('sort')).toBe('eventCount');
  });

  it('從「最新上架」切回「綜合排序」→ URL 的 sort 參數被移除', async () => {
    setMockSearchParams([['sort', 'newest']]);
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /綜合排序/ }));

    const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
    const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');
    expect(search.has('sort')).toBe(false);
  });

  it('帶 ?sort=newest 直接開啟頁面時，dropdown 正確顯示對應選項為選中', async () => {
    setMockSearchParams([['sort', 'newest']]);
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    const selected = within(menu).getByRole('menuitemradio', { name: /最新上架/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
  });
});

// ─── URL 帶不合法 sort 值（2026-09 裁定）────────────────────────────────────

describe('VenuesClient URL 帶不合法 sort 值（Phase 2.8, 2026-09 裁定）', () => {
  it('帶 ?sort=foo 開啟頁面 → dropdown fallback 顯示綜合排序，且網址列被改寫為移除 sort（replace 語意，不新增 history）', async () => {
    setMockSearchParams([['sort', 'foo']]);
    renderVenuesClient();

    await waitFor(() => {
      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string | undefined;
      expect(lastUrl).toBeDefined();
      const search = new URLSearchParams(lastUrl?.split('?')[1] ?? '');
      expect(search.has('sort')).toBe(false);
    });

    expect(historyPushSpy).not.toHaveBeenCalled();

    const menu = await openSortMenu();
    const selected = within(menu).getByRole('menuitemradio', { name: /綜合排序/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
  });
});

// ─── API 請求參數（2026-09 裁定：預設排序不送 sort）──────────────────────────

describe('VenuesClient API 請求參數（Phase 2.8）', () => {
  it('綜合排序（含初始載入的預設狀態）時，呼叫 venueApi.getVenues 的參數不包含 sort', async () => {
    renderVenuesClient();

    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    // queryParams 物件沿用 region/capacityRange 既有慣例：預設值以 undefined 表示（key 仍在，
    // value 為 undefined），實際由 venueApi.getVenues 的參數組裝邏輯（if (params.sort)）決定
    // 是否附加到請求 URL 上，因此這裡驗證值為 undefined 而非 key 不存在。
    const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
    expect(lastCallArgs?.sort).toBeUndefined();
  });

  it('選擇「最新上架」時，呼叫 venueApi.getVenues 帶 sort: "newest"', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() => {
      const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.sort).toBe('newest');
    });
  });

  it('選擇「生咖數最多」時，呼叫 venueApi.getVenues 帶 sort: "eventCount"', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /生咖數最多/ }));

    await waitFor(() => {
      const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.sort).toBe('eventCount');
    });
  });
});

// ─── 排序切換 API 失敗（2026-09 裁定：沿用整頁 isError 狀態）─────────────────

describe('VenuesClient 排序切換 API 失敗（Phase 2.8）', () => {
  it('排序切換觸發的請求失敗時，顯示既有整頁錯誤文案，重試按鈕帶有 icon', async () => {
    vi.mocked(venueApi.getVenues)
      .mockResolvedValueOnce(EMPTY_RESPONSE)
      .mockRejectedValueOnce(new Error('network error'));

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalledTimes(1));

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    await screen.findByText('載入場地列表失敗，請重新整理頁面');

    const retryButton = screen.getByRole('button', { name: '重試' });
    expect(retryButton.querySelector('svg')).toBeTruthy();
  });

  it('點擊重試按鈕後重新發送請求，成功後恢復正常列表', async () => {
    vi.mocked(venueApi.getVenues).mockRejectedValueOnce(new Error('network error'));

    renderVenuesClient();

    await screen.findByText('載入場地列表失敗，請重新整理頁面');

    vi.mocked(venueApi.getVenues).mockResolvedValueOnce(EMPTY_RESPONSE);
    fireEvent.click(screen.getByRole('button', { name: '重試' }));

    await waitFor(() => {
      expect(screen.queryByText('載入場地列表失敗，請重新整理頁面')).toBeNull();
    });
    expect(venueApi.getVenues).toHaveBeenCalledTimes(2);
  });
});

// ─── 既有行為 regression（Phase 2.7 底層邏輯不變，僅換 UI 元件）──────────────

describe('VenuesClient 既有行為 regression（Phase 2.8）', () => {
  it('切換排序後 page 重置為 1、scroll to top、清除 scroll 位置記憶', async () => {
    setMockSearchParams([['page', '3']]);
    sessionStorage.setItem('venues_scrollY', '500');

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    expect(window.scrollTo).toHaveBeenCalled();
    expect(sessionStorage.getItem('venues_scrollY')).toBeNull();

    const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
    const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');
    expect(search.has('page')).toBe(false);
  });

  it('切換排序不影響 region/capacity/search 篩選狀態', async () => {
    setMockSearchParams([
      ['region', '台北'],
      ['capacity', '20-40'],
      ['q', 'abc'],
    ]);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() => {
      const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.sort).toBe('newest');
      expect(lastCallArgs?.region).toEqual(['台北']);
      expect(lastCallArgs?.capacityRange).toBe('20-40');
      expect(lastCallArgs?.search).toBe('abc');
    });
  });

  it('篩選/搜尋結果為 0 筆時，排序 dropdown 仍可正常點擊切換，不 disable', async () => {
    setMockSearchParams([['q', '不存在的場地']]);
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    await screen.findByText(/沒有符合條件的場地/);

    const trigger = getSortTrigger();
    expect(trigger.hasAttribute('disabled')).toBe(false);

    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeTruthy();
  });
});

// ─── Race condition ──────────────────────────────────────────────────────

describe('VenuesClient 排序快速連續切換的 race condition（Phase 2.8）', () => {
  it('快速連續切換排序，且較晚點選的請求先 resolve 時，最終畫面與 URL 皆對應最後一次選擇', async () => {
    type Resolver = (value: typeof EMPTY_RESPONSE) => void;
    const resolvers: Record<string, Resolver> = {};

    vi.mocked(venueApi.getVenues).mockImplementation((params) => {
      const key = params?.sort ?? 'composite';
      return new Promise((resolve) => {
        resolvers[key] = resolve;
      });
    });

    renderVenuesClient();
    // 初始（composite）請求先 resolve，讓 UI 進入非 loading 狀態才能操作 dropdown
    await waitFor(() => expect(resolvers.composite).toBeDefined());
    act(() => resolvers.composite(EMPTY_RESPONSE));
    await waitFor(() => expect(screen.queryByText('載入中')).toBeNull());

    const menu1 = await openSortMenu();
    fireEvent.click(within(menu1).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() => expect(resolvers.newest).toBeDefined());

    const menu2 = await openSortMenu();
    fireEvent.click(within(menu2).getByRole('menuitemradio', { name: /生咖數最多/ }));

    await waitFor(() => expect(resolvers.eventCount).toBeDefined());

    // 較晚選擇的 eventCount 請求先 resolve，較早選擇的 newest 請求後 resolve
    act(() => resolvers.eventCount(EMPTY_RESPONSE));
    act(() => resolvers.newest(EMPTY_RESPONSE));

    await waitFor(() => {
      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');
      expect(search.get('sort')).toBe('eventCount');
    });

    const menu3 = await openSortMenu();
    const selected = within(menu3).getByRole('menuitemradio', { name: /生咖數最多/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
  });
});

// ─── sort_venues 事件與卡片 list_sort（GA 埋點補做）────────────────────────

describe('VenuesClient sort_venues 事件（GA 埋點補做）', () => {
  it('切換排序時送出一次 sort_venues，sort_from 為切換前生效值（未帶 URL 參數時預設為 composite），帶當下 filter/search/result_count', async () => {
    setMockSearchParams([
      ['region', '台北'],
      ['capacity', '20-40'],
      ['q', 'abc'],
    ]);
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    expect(trackSortVenues).toHaveBeenCalledTimes(1);
    expect(trackSortVenues).toHaveBeenCalledWith({
      userId: undefined,
      sortFrom: 'composite',
      sortTo: 'newest',
      filterRegion: '台北',
      filterCapacity: '20-40',
      searchQuery: 'abc',
      resultCount: 1,
    });
  });

  it('選擇跟目前相同的排序值時，不送出 sort_venues', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());
    const callsBefore = vi.mocked(venueApi.getVenues).mock.calls.length;

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /綜合排序/ }));

    expect(trackSortVenues).not.toHaveBeenCalled();
    // 沒有實際切換也不該觸發新的列表請求
    expect(venueApi.getVenues).toHaveBeenCalledTimes(callsBefore);
  });

  it('連續切換兩次排序，第二次事件的 sort_from 是第一次切換後生效的值，不是原始預設值', async () => {
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu1 = await openSortMenu();
    fireEvent.click(within(menu1).getByRole('menuitemradio', { name: /最新上架/ }));
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalledTimes(2));

    const menu2 = await openSortMenu();
    fireEvent.click(within(menu2).getByRole('menuitemradio', { name: /生咖數最多/ }));

    expect(trackSortVenues).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortFrom: 'newest', sortTo: 'eventCount' })
    );
  });
});

// ─── 卡片曝光／點擊帶當下生效的 list_sort（GA 埋點補做）────────────────────

describe('VenuesClient 列表卡片 list_sort（GA 埋點補做）', () => {
  it('卡片曝光帶當下生效的排序值（預設 composite）', async () => {
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());
    renderVenuesClient();

    await waitFor(() => {
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-1', listSort: 'composite' })
      );
    });
  });

  it('卡片點擊帶當下生效的排序值', async () => {
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());
    renderVenuesClient();

    const cardLink = await screen.findByRole('link', { name: /測試場地/ });
    fireEvent.click(cardLink);

    expect(trackClickVenueDetail).toHaveBeenCalledWith(
      expect.objectContaining({ venueId: 'venue-1', listSort: 'composite' })
    );
  });

  it('切換排序後，新出現的卡片曝光帶新的排序值', async () => {
    const venueB = { ...VENUE_FIXTURE, id: 'venue-2', name: '第二個場地' };
    vi.mocked(venueApi.getVenues)
      .mockResolvedValueOnce(oneVenueResponse())
      .mockResolvedValueOnce({
        venues: [venueB],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

    renderVenuesClient();
    await waitFor(() =>
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-1', listSort: 'composite' })
      )
    );

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() =>
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-2', listSort: 'newest' })
      )
    );
  });

  it('同一個場地在 composite 排序曝光過，切到 newest 後再度出現時，仍要再送一次曝光（帶新的 list_sort）', async () => {
    // 同一顆 venue 在兩次排序下都回傳，模擬使用者切排序後同一間場地仍在結果中的情況。
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());

    renderVenuesClient();
    await waitFor(() =>
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-1', listSort: 'composite' })
      )
    );
    expect(trackViewVenueCard).toHaveBeenCalledTimes(1);

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() =>
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-1', listSort: 'newest' })
      )
    );
    expect(trackViewVenueCard).toHaveBeenCalledTimes(2);
  });

  it('同一個場地在同一個排序下重複出現（如分頁返回），不重送曝光事件', async () => {
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());

    const { unmount } = renderVenuesClient();
    await waitFor(() =>
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-1', listSort: 'composite' })
      )
    );
    expect(trackViewVenueCard).toHaveBeenCalledTimes(1);
    unmount();

    // 同一 session、同一排序下重新渲染（模擬同頁重新 mount，如分頁返回），
    // sessionStorage 的去重 key 應該仍視為「已曝光過」而不重送。
    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalledTimes(2));
    await screen.findByRole('link', { name: /測試場地/ });

    expect(trackViewVenueCard).toHaveBeenCalledTimes(1);
  });
});
