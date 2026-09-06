import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VenueFilters from './VenueFilters';

// jsdom does not implement ResizeObserver; VenueFilters only uses it to toggle
// the region row's scroll fade indicators, which isn't under test here.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

afterEach(cleanup);

const baseProps = {
  regions: ['全部', '台北'],
  region: '全部',
  onRegionChange: vi.fn(),
  capacity: 'all' as const,
  onCapacityChange: vi.fn(),
  onSearchChange: vi.fn(),
  sort: 'newest' as const,
  onSortChange: vi.fn(),
  onClearFilters: vi.fn(),
};

describe('VenueFilters 搜尋框 debounce（800ms，對齊 PlaceAutocomplete/ArtistSearchModal）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('連續輸入時，只在停止打字 800ms 後呼叫一次 onSearchChange', () => {
    const onSearchChange = vi.fn();
    render(<VenueFilters {...baseProps} search="" onSearchChange={onSearchChange} />);

    const input = screen.getByLabelText('搜尋場地名稱');

    fireEvent.change(input, { target: { value: 'A' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.change(input, { target: { value: 'AB' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.change(input, { target: { value: 'ABC' } });

    // 尚未達到 800ms，不應觸發
    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('ABC');
  });

  it('掛載時不會因為初始值觸發 onSearchChange', () => {
    const onSearchChange = vi.fn();
    render(<VenueFilters {...baseProps} search="台北" onSearchChange={onSearchChange} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('清除搜尋框後，debounce 後以空字串呼叫 onSearchChange', () => {
    const onSearchChange = vi.fn();
    render(<VenueFilters {...baseProps} search="ABC" onSearchChange={onSearchChange} />);

    fireEvent.click(screen.getByLabelText('清除搜尋'));

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});

describe('VenueFilters 清除篩選按鈕', () => {
  it('地區/容納人數/搜尋皆為預設值時，按鈕不顯示', () => {
    render(<VenueFilters {...baseProps} search="" />);

    expect(screen.queryByRole('button', { name: '清除篩選' })).toBeNull();
  });

  it('地區非預設值時，按鈕顯示', () => {
    render(<VenueFilters {...baseProps} region="台北" search="" />);

    expect(screen.getByRole('button', { name: '清除篩選' })).toBeTruthy();
  });

  it('容納人數非預設值時，按鈕顯示', () => {
    render(<VenueFilters {...baseProps} capacity="20-40" search="" />);

    expect(screen.getByRole('button', { name: '清除篩選' })).toBeTruthy();
  });

  it('搜尋框有輸入內容時，按鈕立即顯示（不需等 debounce）', () => {
    render(<VenueFilters {...baseProps} search="" />);

    expect(screen.queryByRole('button', { name: '清除篩選' })).toBeNull();

    fireEvent.change(screen.getByLabelText('搜尋場地名稱'), { target: { value: 'A' } });

    expect(screen.getByRole('button', { name: '清除篩選' })).toBeTruthy();
  });

  it('點擊後呼叫 onClearFilters', () => {
    const onClearFilters = vi.fn();
    render(<VenueFilters {...baseProps} region="台北" search="" onClearFilters={onClearFilters} />);

    fireEvent.click(screen.getByRole('button', { name: '清除篩選' }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});

// Phase 2.8：排序 UI 由 segmented control 改為 dropdown，比照既有 capacity dropdown pattern。
//
// Trigger 用 aria-label="排序" 直接提供可及名稱（accessible name），畫面上不顯示「排序」
// 文字標籤（預設值就是「綜合排序」，畫面文字已足夠表意，省下的空間讓清除篩選 icon 按鈕
// 能併進同一行，詳見 Phase 2.9「清除篩選版面調整」）。因此查詢 trigger 一律用 name: '排序'，
// 選中值改用畫面可見文字（getByText）驗證。
describe('VenueFilters 排序下拉選單（Phase 2.8）', () => {
  afterEach(() => {
    cleanup();
  });

  const getSortTrigger = () => screen.getByRole('button', { name: '排序' });

  it('未帶 sort（等同 composite）時，trigger 顯示「綜合排序」', () => {
    render(<VenueFilters {...baseProps} sort="composite" search="" />);

    expect(screen.getByText('綜合排序')).toBeTruthy();
  });

  it('點擊 trigger 開啟選單，顯示三個選項且結構為 role="menu" / role="menuitemradio"', () => {
    render(<VenueFilters {...baseProps} sort="composite" search="" />);

    fireEvent.click(getSortTrigger());

    const menu = screen.getByRole('menu');
    const options = within(menu).getAllByRole('menuitemradio');
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining('綜合排序'),
      expect.stringContaining('最新上架'),
      expect.stringContaining('生咖數最多'),
    ]);
  });

  it('選中項目具備 aria-checked=true 與 checkmark（✓）', () => {
    render(<VenueFilters {...baseProps} sort="newest" search="" />);

    fireEvent.click(getSortTrigger());

    const menu = screen.getByRole('menu');
    const selected = within(menu).getByRole('menuitemradio', { name: /最新上架/ });
    expect(selected.getAttribute('aria-checked')).toBe('true');
    expect(selected.textContent).toContain('✓');

    const notSelected = within(menu).getByRole('menuitemradio', { name: /生咖數最多/ });
    expect(notSelected.getAttribute('aria-checked')).toBe('false');
  });

  it('點擊「最新上架」選項會呼叫 onSortChange("newest") 並關閉選單', () => {
    const onSortChange = vi.fn();
    render(<VenueFilters {...baseProps} sort="composite" search="" onSortChange={onSortChange} />);

    fireEvent.click(getSortTrigger());
    fireEvent.click(screen.getByRole('menuitemradio', { name: /最新上架/ }));

    expect(onSortChange).toHaveBeenCalledWith('newest');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('點擊選單外側自動關閉', () => {
    render(
      <div>
        <VenueFilters {...baseProps} sort="composite" search="" />
        <button type="button">外部元素</button>
      </div>
    );

    fireEvent.click(getSortTrigger());
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole('button', { name: '外部元素' }));

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('trigger 具備 aria-haspopup/aria-expanded/aria-label="排序"（畫面不顯示文字標籤）', () => {
    render(<VenueFilters {...baseProps} sort="composite" search="" />);

    expect(screen.queryByText('排序')).toBeNull();

    const trigger = getSortTrigger();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe('排序');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('鍵盤操作：Tab 聚焦 trigger、Enter 開啟選單', async () => {
    const user = userEvent.setup();
    render(<VenueFilters {...baseProps} sort="composite" search="" />);

    const trigger = getSortTrigger();
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    await user.keyboard('{Enter}');

    expect(screen.getByRole('menu')).toBeTruthy();
  });
});

// 滾動收合 filter bar：比照瀏覽器網址列隱藏/顯示，滾多少收多少（見元件內註解）。
// requestAnimationFrame 被 stub 成手動可控（捕捉 callback、不自動執行），用來驗證：
// (a) 同一 frame 內多次 scroll 事件只排程一次 RAF（問題 3：批次合併）
// (b) hideOffset 的累加/遞減/clamp/歸零邏輯（問題 4）
// jsdom 不做真正的版面配置，offsetHeight 預設為 0，因此每個測試視需要手動覆寫
// barRef 元素的 offsetHeight，模擬 filter bar 實際高度。
describe('VenueFilters 滾動收合 filter bar', () => {
  let rafCallbacks: FrameRequestCallback[];
  let rafSpy: ReturnType<typeof vi.fn>;
  let cancelRafSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rafCallbacks = [];
    rafSpy = vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    cancelRafSpy = vi.fn();
    vi.stubGlobal('requestAnimationFrame', rafSpy);
    vi.stubGlobal('cancelAnimationFrame', cancelRafSpy);
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    cleanup();
  });

  // 手動執行目前排隊中的 RAF callback，模擬瀏覽器跑到下一個 frame。
  // 包在 act() 內，因為 callback 裡的 setHideOffset 不是透過 RTL 的 fireEvent 觸發，
  // 不會被自動包進 act()。
  const flushRaf = () => {
    const pending = rafCallbacks;
    rafCallbacks = [];
    act(() => {
      pending.forEach((cb) => cb(0));
    });
  };

  const scrollTo = (y: number) => {
    Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
    fireEvent.scroll(window);
  };

  const renderBar = (barHeight = 999) => {
    const { container } = render(<VenueFilters {...baseProps} search="" />);
    const bar = container.firstChild as HTMLElement;
    Object.defineProperty(bar, 'offsetHeight', { value: barHeight, configurable: true });
    return bar;
  };

  it('往下滾動時，hideOffset 隨滾動距離 1:1 累加', () => {
    const bar = renderBar();

    scrollTo(100); // > 80 門檻，delta = 100 - 0
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-100px)');

    scrollTo(140); // delta = 40，累加至 140
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-140px)');
  });

  it('往上滾動時，hideOffset 隨滾動距離 1:1 遞減', () => {
    const bar = renderBar();

    scrollTo(150);
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-150px)');

    scrollTo(100); // delta = -50，遞減至 100
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-100px)');
  });

  it('hideOffset 不會超過 bar 自身高度（clamp 上限）', () => {
    const bar = renderBar(50);

    scrollTo(300); // delta 遠大於 barHeight
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-50px)');
  });

  it('距離頁面頂部 < 80px 時，hideOffset 強制歸零', () => {
    const bar = renderBar();

    scrollTo(200);
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-200px)');

    scrollTo(50); // < 80，不論 delta 為何一律歸零
    flushRaf();
    expect(bar.style.transform).toBe('translateY(-0px)');
  });

  it('同一 frame 內連續多次 scroll 事件，只排程一次 requestAnimationFrame', () => {
    renderBar();

    scrollTo(90);
    scrollTo(95);
    scrollTo(99);
    expect(rafSpy).toHaveBeenCalledTimes(1);

    flushRaf();

    scrollTo(120); // 上一個 frame 已 flush，ticking 重置，可以再排一次
    expect(rafSpy).toHaveBeenCalledTimes(2);
  });

  it('元件 unmount 時會取消 pending RAF（傳入正確 id）', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount, container } = render(<VenueFilters {...baseProps} search="" />);
    const bar = container.firstChild as HTMLElement;
    Object.defineProperty(bar, 'offsetHeight', { value: 999, configurable: true });

    // 觸發一次 scroll，讓元件排程一個 pending RAF，但先不執行它的 callback。
    scrollTo(100);
    expect(rafSpy).toHaveBeenCalledTimes(1);
    const pendingRafId = rafSpy.mock.results[0]?.value;

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    // 核心斷言：cancelAnimationFrame 被呼叫，且傳入的 id 跟 unmount 前排程的那個 RAF id 一致。
    // 拿掉程式碼裡的 cancelAnimationFrame(rafId) 這行的話，這個斷言會失敗。
    //
    // 不再額外斷言「unmount 後強制執行該 callback，DOM 不會變化」——元件已從 React tree
    // 拔除，就算 setState 真的被呼叫，React 也不會把它反映到已卸載的 DOM 節點上，這件事
    // 不論 cancelAnimationFrame 有沒有生效都成立，無法用來證明 cancel 是否真的發生。
    expect(cancelRafSpy).toHaveBeenCalledWith(pendingRafId);
  });
});
