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
  sort: 'eventCount' as const,
  onSortChange: vi.fn(),
};

describe('VenueFilters 搜尋框 debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('連續輸入時，只在停止打字 300ms 後呼叫一次 onSearchChange', () => {
    const onSearchChange = vi.fn();
    render(<VenueFilters {...baseProps} search="" onSearchChange={onSearchChange} />);

    const input = screen.getByLabelText('搜尋場地名稱');

    fireEvent.change(input, { target: { value: 'A' } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(input, { target: { value: 'AB' } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(input, { target: { value: 'ABC' } });

    // 尚未達到 300ms，不應觸發
    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('ABC');
  });

  it('掛載時不會因為初始值觸發 onSearchChange', () => {
    const onSearchChange = vi.fn();
    render(<VenueFilters {...baseProps} search="台北" onSearchChange={onSearchChange} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('清除搜尋框後，debounce 後以空字串呼叫 onSearchChange', () => {
    const onSearchChange = vi.fn();
    render(<VenueFilters {...baseProps} search="ABC" onSearchChange={onSearchChange} />);

    fireEvent.click(screen.getByLabelText('清除搜尋'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
