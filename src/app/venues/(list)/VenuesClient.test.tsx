import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import { venueApi } from '@/lib/api';
import {
  trackClickVenueDetail,
  trackResolveVenueGeolocation,
  trackSortVenues,
  trackViewVenueCard,
} from '@/lib/analytics/venues';
import { showToast } from '@/lib/toast';
import { __resetVenueDistanceSortCacheForTests } from '@/components/venues/hooks/useVenueDistanceSort';
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
  trackResolveVenueGeolocation: vi.fn(),
  toVenueContentId: (id: string) => `venue_${id}`,
}));

vi.mock('@/lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// venue-distance-sort — IAB 判斷（比照上面 searchParams 的 lazy mock pattern）。
// 預設非 IAB、判斷已完成，既有（與本功能無關）的測試不需要關心這個狀態。
let currentIabState: { isInAppBrowser: boolean; loading: boolean } = {
  isInAppBrowser: false,
  loading: false,
};
function setMockIabState(state: { isInAppBrowser: boolean; loading: boolean }) {
  currentIabState = state;
}
vi.mock('@/hooks/useIsInAppBrowser', () => ({
  useIsInAppBrowser: () => currentIabState,
}));

// 真實 navigator.geolocation.getCurrentPosition（qa.md 情境 29–33 的既定 mock 策略：
// 直接 mock 瀏覽器原生 API，不假設 useVenueDistanceSort 內部實作）。jsdom 預設不含
// `geolocation`，符合「不支援 Geolocation API」情境（scenario 31）的預設狀態。
function stubGeolocationApi(getCurrentPosition: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
}
function clearGeolocationApiStub() {
  // configurable:true above allows this; reverts to jsdom's default
  // ('geolocation' in navigator === false), matching an unsupported browser.
  delete (navigator as unknown as { geolocation?: unknown }).geolocation;
}

type GeolocationSuccessCallback = (position: {
  coords: { latitude: number; longitude: number };
}) => void;
type GeolocationErrorCallback = (error: { code: number }) => void;

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
  // 用 function 每次產生「新」的 element（而非重複傳入同一個 JSX 物件參考）——React 對
  // reference-identical 的 root element 會 bail out、完全不重新呼叫元件本體，導致
  // mocked hook（如 useIsInAppBrowser）的最新回傳值永遠讀不到。
  const buildTree = () => (
    <QueryClientProvider client={queryClient}>
      <QueryStateProvider>
        <VenuesClient regions={['全部', '台北']} />
      </QueryStateProvider>
    </QueryClientProvider>
  );
  const result = render(buildTree());
  // 強迫 mocked useIsInAppBrowser 等 hook 讀到最新的模組級狀態（如 currentIabState 轉換），
  // 模擬真實 hook 在 loading 完成後觸發的那次 re-render。
  return { ...result, rerenderSame: () => result.rerender(buildTree()) };
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
  setMockIabState({ isInAppBrowser: false, loading: false });
  __resetVenueDistanceSortCacheForTests();
  vi.mocked(venueApi.getVenues).mockReset();
  vi.mocked(venueApi.getVenues).mockResolvedValue(EMPTY_RESPONSE);
  historyReplaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  historyPushSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  clearGeolocationApiStub();
  __resetVenueDistanceSortCacheForTests();
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

// ═══════════════════════════════════════════════════════════════════════════
// venue-distance-sort（qa.md 情境 27–38, 41）
// ═══════════════════════════════════════════════════════════════════════════

describe('venue-distance-sort — 進頁不觸發定位（qa.md 情境 27）', () => {
  it('未選取「距離最近」時，不論是否帶其他篩選參數，不會呼叫 getCurrentPosition', async () => {
    const getCurrentPosition = vi.fn();
    stubGeolocationApi(getCurrentPosition);
    setMockSearchParams([['region', '台北']]);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});

describe('venue-distance-sort — 選取「距離最近」的立即反饋（qa.md 情境 28）', () => {
  it('點選後立即關閉選單、trigger 文字更新、URL 帶上 sort=distance，並顯示等待定位提示與 skeleton', async () => {
    // 不觸發 success/error callback，模擬「正在等待使用者回應授權彈窗」這段期間。
    const getCurrentPosition = vi.fn();
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByText('距離最近')).toBeTruthy();

    const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
    expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').get('sort')).toBe('distance');

    expect(screen.getByRole('status').textContent).toBe('正在取得你的位置…');
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});

describe('venue-distance-sort — 定位成功（qa.md 情境 29）', () => {
  it('成功後以 rounded 座標打 API，取得距離排序結果', async () => {
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.0330123, longitude: 121.5644999 } });
    });
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() => {
      const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.sort).toBe('distance');
      expect(lastCallArgs?.lat).toBe(25.033);
      expect(lastCallArgs?.lng).toBe(121.564);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('venue-distance-sort — 定位失敗 PERMISSION_DENIED（qa.md 情境 30）', () => {
  it('顯示拒絕文案（warning，duration 5000）、排序退回綜合排序、URL 清除 sort=distance', async () => {
    const getCurrentPosition = vi.fn((_success: unknown, error: GeolocationErrorCallback) => {
      error({ code: 1 });
    });
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() => {
      expect(showToast.warning).toHaveBeenCalledWith(
        expect.stringContaining('請至瀏覽器設定重新開啟定位權限'),
        { duration: 5000 }
      );
    });

    await waitFor(() => {
      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').has('sort')).toBe(false);
    });

    const menu2 = await openSortMenu();
    const selected = within(menu2).getByRole('menuitemradio', { name: /綜合排序/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
  });
});

describe('venue-distance-sort — 瀏覽器不支援 geolocation（qa.md 情境 31）', () => {
  it('不呼叫 getCurrentPosition，直接顯示不支援文案並退回綜合排序', async () => {
    expect('geolocation' in navigator).toBe(false);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() => {
      expect(showToast.warning).toHaveBeenCalledWith('目前無法取得你的位置，已改用綜合排序。', {
        duration: 5000,
      });
    });
  });

  it('非 IAB 從分享連結帶 ?sort=distance 進站時，瀏覽器不支援的行為與主動點選一致', async () => {
    expect('geolocation' in navigator).toBe(false);
    setMockSearchParams([['sort', 'distance']]);

    renderVenuesClient();

    await waitFor(() => {
      expect(showToast.warning).toHaveBeenCalledWith('目前無法取得你的位置，已改用綜合排序。', {
        duration: 5000,
      });
    });
  });
});

describe('venue-distance-sort — TIMEOUT／POSITION_UNAVAILABLE（qa.md 情境 32）', () => {
  it.each([2, 3])('error.code=%s 皆顯示不支援/逾時文案並退回綜合排序', async (code) => {
    const getCurrentPosition = vi.fn((_success: unknown, error: GeolocationErrorCallback) => {
      error({ code });
    });
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() => {
      expect(showToast.warning).toHaveBeenCalledWith('目前無法取得你的位置，已改用綜合排序。', {
        duration: 5000,
      });
    });

    const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
    expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').has('sort')).toBe(false);
  });
});

describe('venue-distance-sort — 等待中切到其他排序，定位結果晚回不套用 UI（qa.md 情境 33）', () => {
  it('切走後立即依新排序 fetch；稍後成功的定位結果不顯示 toast、不改 URL，但座標仍快取、GA 事件仍送出', async () => {
    let capturedSuccess: GeolocationSuccessCallback | undefined;
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      capturedSuccess = success;
    });
    stubGeolocationApi(getCurrentPosition);
    // 需要卡片本身有座標才能驗證「晚到成功後卡片仍顯示距離」，換掉預設的 EMPTY_RESPONSE。
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu1 = await openSortMenu();
    fireEvent.click(within(menu1).getByRole('menuitemradio', { name: /距離最近/ }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    const menu2 = await openSortMenu();
    fireEvent.click(within(menu2).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() => {
      const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.sort).toBe('newest');
    });

    const urlCallsBeforeResolve = historyReplaceSpy.mock.calls.length;

    act(() => {
      capturedSuccess?.({ coords: { latitude: 25.033, longitude: 121.564 } });
    });

    await waitFor(() => {
      expect(trackResolveVenueGeolocation).toHaveBeenCalledWith(
        expect.objectContaining({ locationResult: 'granted', source: 'menu_select' })
      );
    });

    expect(showToast.warning).not.toHaveBeenCalled();
    expect(historyReplaceSpy.mock.calls.length).toBe(urlCallsBeforeResolve);

    // qa.md 情境 33（2026-10-07 使用者裁定）：排序維持使用者切換後選的那個（這裡是
    // 「最新上架」，不跳回/不被拉回 distance）、不跳 toast、不改 URL——以上已驗證；
    // 但卡片仍要照常顯示距離文字，因為顯示條件只看「本次瀏覽期間是否已取得座標」，
    // 與目前選中哪個排序無關（requirements.md 第 29 行「距離顯示與排序選項脫鉤」）。
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /測試場地/ }).textContent).toMatch(/公尺|公里/);
    });
    expect(screen.getByText('最新上架')).toBeTruthy();

    // 座標已寫入記憶體快取：切回「距離最近」不再重新呼叫 getCurrentPosition
    getCurrentPosition.mockClear();
    const menu3 = await openSortMenu();
    fireEvent.click(within(menu3).getByRole('menuitemradio', { name: /距離最近/ }));
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  // qa.md 情境 33 失敗分支（2026-10-07 使用者裁定 + Codex 第三輪 code review 要求補測）：
  // 已切到其他排序後，稍後才回來的定位結果若是失敗，同樣不套用任何 UI 效果——不跳 toast、
  // 排序不變（維持使用者切換後的選項）、URL 不變；但 GA 事件仍要照常送出。
  it('切走後定位才失敗：不顯示 toast、排序不變、URL 不變，GA 事件仍送出', async () => {
    let capturedError: GeolocationErrorCallback | undefined;
    const getCurrentPosition = vi.fn(
      (_success: GeolocationSuccessCallback, error: GeolocationErrorCallback) => {
        capturedError = error;
      }
    );
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu1 = await openSortMenu();
    fireEvent.click(within(menu1).getByRole('menuitemradio', { name: /距離最近/ }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    const menu2 = await openSortMenu();
    fireEvent.click(within(menu2).getByRole('menuitemradio', { name: /最新上架/ }));

    await waitFor(() => {
      const lastCallArgs = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.sort).toBe('newest');
    });

    const urlCallsBeforeResolve = historyReplaceSpy.mock.calls.length;

    act(() => {
      capturedError?.({ code: 1 });
    });

    await waitFor(() => {
      expect(trackResolveVenueGeolocation).toHaveBeenCalledWith(
        expect.objectContaining({ locationResult: 'denied', source: 'menu_select' })
      );
    });

    // 不顯示 toast、不改 URL（排序沒被拉回/清掉）。
    expect(showToast.warning).not.toHaveBeenCalled();
    expect(historyReplaceSpy.mock.calls.length).toBe(urlCallsBeforeResolve);

    // 排序仍是使用者切換後選的「最新上架」。
    const menu3 = await openSortMenu();
    const selected = within(menu3).getByRole('menuitemradio', { name: /最新上架/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
  });
});

describe('venue-distance-sort — 已有座標時不重新定位，且每次請求帶相同座標（qa.md 情境 34）', () => {
  it('換頁、換篩選、切到其他排序後切回，皆沿用快取座標，不重新呼叫 getCurrentPosition', async () => {
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    stubGeolocationApi(getCurrentPosition);
    vi.mocked(venueApi.getVenues).mockResolvedValue({
      venues: [VENUE_FIXTURE],
      pagination: { page: 1, limit: 20, total: 40, totalPages: 2 },
    });

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));
    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.lat).toBe(25.033);
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    // 換頁
    fireEvent.click(screen.getByRole('button', { name: '前往下一頁' }));
    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.page).toBe(2);
      expect(last?.lat).toBe(25.033);
      expect(last?.lng).toBe(121.564);
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    // 換篩選（地區）
    fireEvent.click(screen.getByRole('button', { name: '台北' }));
    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.region).toEqual(['台北']);
      expect(last?.lat).toBe(25.033);
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    // 切到其他排序 → 不帶 lat/lng
    const menu2 = await openSortMenu();
    fireEvent.click(within(menu2).getByRole('menuitemradio', { name: /最新上架/ }));
    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.sort).toBe('newest');
      expect(last?.lat).toBeUndefined();
      expect(last?.lng).toBeUndefined();
    });

    // 切回「距離最近」：不重新呼叫 getCurrentPosition，沿用快取座標。這裡不斷言
    // venueApi.getVenues 的「最後一次呼叫」參數——這組 filter/page/座標組合在本測試較早
    // 已經打過一次，React Query 的 staleTime 快取讓這次切回直接命中快取、不重新發
    // request，是預期的既有快取行為，不是本情境要驗證的重點（本情境驗證的是「不重新
    // 定位」，不是「每次都重新打 API」）。
    const menu3 = await openSortMenu();
    fireEvent.click(within(menu3).getByRole('menuitemradio', { name: /距離最近/ }));
    await waitFor(() => {
      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').get('sort')).toBe('distance');
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});

describe('venue-distance-sort — 不寫入 localStorage/sessionStorage（qa.md 情境 35）', () => {
  it('定位成功流程跑一次後，所有 Storage.setItem 呼叫都不含座標數值', async () => {
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    stubGeolocationApi(getCurrentPosition);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.lat).toBe(25.033);
    });

    const coordWrites = setItemSpy.mock.calls.filter(([, value]) =>
      String(value).includes('25.033')
    );
    expect(coordWrites).toHaveLength(0);
  });
});

describe('venue-distance-sort — IAB 開啟 ?sort=distance 連結（qa.md 情境 36）', () => {
  it('loading 期間不呼叫定位、不顯示提示；resolve 為 IAB 後只清除 sort，其餘參數保留', async () => {
    setMockIabState({ isInAppBrowser: false, loading: true });
    setMockSearchParams([
      ['sort', 'distance'],
      ['region', '台北'],
    ]);
    const getCurrentPosition = vi.fn();
    stubGeolocationApi(getCurrentPosition);

    const { rerenderSame } = renderVenuesClient();

    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(screen.queryByText('正在取得你的位置…')).toBeNull();

    setMockIabState({ isInAppBrowser: true, loading: false });
    rerenderSame();

    await waitFor(() => {
      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');
      expect(search.has('sort')).toBe(false);
      expect(search.get('region')).toBe('台北');
    });

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});

describe('venue-distance-sort — 非 IAB 開啟 ?sort=distance 連結（qa.md 情境 37）', () => {
  it('loading 期間不呼叫定位、不顯示提示；resolve 為非 IAB 後直接進入等待定位狀態，不先顯示綜合排序結果', async () => {
    setMockIabState({ isInAppBrowser: false, loading: true });
    setMockSearchParams([['sort', 'distance']]);
    const getCurrentPosition = vi.fn();
    stubGeolocationApi(getCurrentPosition);
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());

    const { rerenderSame } = renderVenuesClient();

    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(screen.queryByText('正在取得你的位置…')).toBeNull();

    setMockIabState({ isInAppBrowser: false, loading: false });
    rerenderSame();

    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1));
    // 不會先短暫顯示一份綜合排序的結果（composite 下本應出現的 venue-1 此刻不該出現）
    expect(screen.queryByRole('link', { name: /測試場地/ })).toBeNull();
  });
});

describe('venue-distance-sort — URL 永不出現座標（qa.md 情境 38）', () => {
  it('定位成功、換頁等操作後，所有 history push/replace 的 URL 都不含 lat/lng', async () => {
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    stubGeolocationApi(getCurrentPosition);
    vi.mocked(venueApi.getVenues).mockResolvedValue({
      venues: [VENUE_FIXTURE],
      pagination: { page: 1, limit: 20, total: 40, totalPages: 2 },
    });

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));
    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.sort).toBe('distance');
      expect(last?.lat).toBe(25.033);
    });

    fireEvent.click(screen.getByRole('button', { name: '前往下一頁' }));
    await waitFor(() => {
      const last = vi.mocked(venueApi.getVenues).mock.calls.at(-1)?.[0];
      expect(last?.page).toBe(2);
    });

    const allUrls = [...historyReplaceSpy.mock.calls, ...historyPushSpy.mock.calls].map(
      (call) => call[2] as string
    );
    for (const url of allUrls) {
      expect(url).not.toMatch(/lat=|lng=/);
    }
  });
});

describe('venue-distance-sort — sort_venues／list_sort（qa.md 情境 41）', () => {
  it('從 dropdown 主動選取「距離最近」會觸發 sort_venues，sort_to=distance', async () => {
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    expect(trackSortVenues).toHaveBeenCalledWith(
      expect.objectContaining({ sortFrom: 'composite', sortTo: 'distance' })
    );
  });

  it('從分享連結帶 ?sort=distance 進站不會觸發 sort_venues（由 resolve_venue_geolocation 的 source=share_link 涵蓋）', async () => {
    setMockSearchParams([['sort', 'distance']]);
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();

    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1));
    expect(trackSortVenues).not.toHaveBeenCalled();
    expect(trackResolveVenueGeolocation).toHaveBeenCalledWith(
      expect.objectContaining({ locationResult: 'granted', source: 'share_link' })
    );
  });

  it('距離排序生效時，卡片曝光的 list_sort 為 distance', async () => {
    const getCurrentPosition = vi.fn((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    stubGeolocationApi(getCurrentPosition);
    vi.mocked(venueApi.getVenues).mockResolvedValue(oneVenueResponse());

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() =>
      expect(trackViewVenueCard).toHaveBeenCalledWith(
        expect.objectContaining({ venueId: 'venue-1', listSort: 'distance' })
      )
    );
  });

  it('非 IAB 定位失敗自動退回綜合排序時，不會多觸發一次 distance→composite 的 sort_venues（系統自動 fallback，非使用者主動切換）', async () => {
    const getCurrentPosition = vi.fn((_success: unknown, error: GeolocationErrorCallback) => {
      error({ code: 1 });
    });
    stubGeolocationApi(getCurrentPosition);

    renderVenuesClient();
    await waitFor(() => expect(venueApi.getVenues).toHaveBeenCalled());

    const menu = await openSortMenu();
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /距離最近/ }));

    await waitFor(() => {
      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      expect(new URLSearchParams(lastUrl.split('?')[1] ?? '').has('sort')).toBe(false);
    });

    expect(trackSortVenues).not.toHaveBeenCalledWith(
      expect.objectContaining({ sortFrom: 'distance', sortTo: 'composite' })
    );
  });
});
