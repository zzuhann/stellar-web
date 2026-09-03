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
// Trigger 的 aria-labelledby="sort-label" 會覆蓋其可及名稱（accessible name）為可見的
// 「排序」標籤本身（比照現有 capacity trigger：accessible name 為「空間人數」而非目前選中的
// 「不限」），因此查詢 trigger 一律用 name: '排序'，選中值改用畫面可見文字（getByText）驗證。
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

  it('只有「綜合排序」選項顯示輔助說明文字，其餘兩項不顯示', () => {
    render(<VenueFilters {...baseProps} sort="composite" search="" />);

    fireEvent.click(getSortTrigger());

    expect(screen.getByText('依活躍度與瀏覽熱度綜合評分')).toBeTruthy();

    const menu = screen.getByRole('menu');
    const options = within(menu).getAllByRole('menuitemradio');
    const newestOption = options.find((o) => o.textContent?.includes('最新上架'));
    const eventCountOption = options.find((o) => o.textContent?.includes('生咖數最多'));
    expect(newestOption?.textContent).not.toContain('依活躍度');
    expect(eventCountOption?.textContent).not.toContain('依活躍度');
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

  it('trigger 具備 aria-haspopup/aria-expanded/aria-labelledby，且畫面上有可見「排序」標籤', () => {
    render(<VenueFilters {...baseProps} sort="composite" search="" />);

    const label = screen.getByText('排序');
    expect(label.id).toBeTruthy();

    const trigger = getSortTrigger();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-labelledby')).toBe(label.id);

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
