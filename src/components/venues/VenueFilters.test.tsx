import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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
