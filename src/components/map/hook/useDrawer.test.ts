import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDrawer, {
  calculateMaxHeight,
  COLLAPSED_HEIGHT,
  CARD_HEIGHT,
  HANDLE_BAR_HEIGHT,
  CONTENT_PADDING,
  CARD_GAP,
} from './useDrawer';

// Mock useMapStore
const mockSetIsDrawerExpanded = vi.fn();
const mockSetExpandedHeight = vi.fn();
let mockIsDrawerExpanded = false;

vi.mock('@/store', () => ({
  useMapStore: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = {
        isDrawerExpanded: mockIsDrawerExpanded,
        setIsDrawerExpanded: mockSetIsDrawerExpanded,
        setExpandedHeight: mockSetExpandedHeight,
      };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({
        isDrawerExpanded: mockIsDrawerExpanded,
        setIsDrawerExpanded: mockSetIsDrawerExpanded,
        setExpandedHeight: mockSetExpandedHeight,
      }),
    }
  ),
}));

describe('calculateMaxHeight', () => {
  const screenHeight = 800;

  it('應該在 0 個事件時返回最小內容高度', () => {
    const result = calculateMaxHeight(0, screenHeight);
    const expectedMinHeight = HANDLE_BAR_HEIGHT + CONTENT_PADDING * 2 + CARD_HEIGHT + 20;
    expect(result).toBe(expectedMinHeight);
  });

  it('應該根據 1 個事件計算正確高度', () => {
    const result = calculateMaxHeight(1, screenHeight);
    const expectedHeight = HANDLE_BAR_HEIGHT + CONTENT_PADDING * 2 + CARD_HEIGHT + 20;
    expect(result).toBe(expectedHeight);
  });

  it('應該根據多個事件計算正確高度（包含間距）', () => {
    const eventsCount = 3;
    const result = calculateMaxHeight(eventsCount, screenHeight);
    const expectedHeight =
      HANDLE_BAR_HEIGHT +
      CONTENT_PADDING * 2 +
      CARD_HEIGHT * eventsCount +
      CARD_GAP * (eventsCount - 1) +
      20;
    expect(result).toBe(expectedHeight);
  });

  it('不應超過螢幕高度的 75%', () => {
    const eventsCount = 10;
    const result = calculateMaxHeight(eventsCount, screenHeight);
    const maxScreenHeight = screenHeight * 0.75;
    expect(result).toBeLessThanOrEqual(maxScreenHeight);
  });

  it('當內容高度小於螢幕限制時，應返回內容高度', () => {
    const eventsCount = 1;
    const result = calculateMaxHeight(eventsCount, screenHeight);
    const contentHeight = HANDLE_BAR_HEIGHT + CONTENT_PADDING * 2 + CARD_HEIGHT + 20;
    const maxScreenHeight = screenHeight * 0.75;

    expect(contentHeight).toBeLessThan(maxScreenHeight);
    expect(result).toBe(contentHeight);
  });
});

describe('useDrawer', () => {
  beforeEach(() => {
    vi.stubGlobal('innerHeight', 800);
    mockIsDrawerExpanded = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('初始狀態', () => {
    it('初始高度應為 COLLAPSED_HEIGHT', () => {
      const { result } = renderHook(() => useDrawer({ eventsCount: 1 }));
      expect(result.current.style.height).toBe(COLLAPSED_HEIGHT);
    });

    it('初始時不應有動畫', () => {
      const { result } = renderHook(() => useDrawer({ eventsCount: 1 }));
      expect(result.current.style.transition).toBe('none');
    });

    it('應該呼叫 setExpandedHeight', () => {
      renderHook(() => useDrawer({ eventsCount: 1 }));
      expect(mockSetExpandedHeight).toHaveBeenCalledWith(800 * 0.75);
    });
  });

  describe('bind handlers', () => {
    it('應該提供 handleMouseDown', () => {
      const { result } = renderHook(() => useDrawer({ eventsCount: 1 }));
      expect(typeof result.current.bind.handleMouseDown).toBe('function');
    });

    it('應該提供 handleTouchStart', () => {
      const { result } = renderHook(() => useDrawer({ eventsCount: 1 }));
      expect(typeof result.current.bind.handleTouchStart).toBe('function');
    });
  });

  describe('toggleDrawer', () => {
    it('應該呼叫 setIsDrawerExpanded 並切換狀態', () => {
      const { result } = renderHook(() => useDrawer({ eventsCount: 1 }));

      act(() => {
        result.current.toggleDrawer();
      });

      expect(mockSetIsDrawerExpanded).toHaveBeenCalledWith(true);
    });
  });

  describe('isDrawerExpanded 變化', () => {
    it('當 isDrawerExpanded 從 false 變成 true 時，應更新高度', () => {
      const { result, rerender } = renderHook(() => useDrawer({ eventsCount: 1 }));

      expect(result.current.style.height).toBe(COLLAPSED_HEIGHT);

      // 模擬 store 狀態變化
      mockIsDrawerExpanded = true;
      rerender();

      const expectedMaxHeight = calculateMaxHeight(1, 800);
      expect(result.current.style.height).toBe(expectedMaxHeight);
      expect(result.current.style.transition).toBe('height 0.3s ease-out');
    });
  });

  describe('eventsCount 變化', () => {
    it('當展開時 eventsCount 變化，應更新高度', () => {
      mockIsDrawerExpanded = true;
      const { result, rerender } = renderHook(({ eventsCount }) => useDrawer({ eventsCount }), {
        initialProps: { eventsCount: 1 },
      });

      const initialHeight = calculateMaxHeight(1, 800);
      expect(result.current.style.height).toBe(initialHeight);

      // 變更事件數量
      rerender({ eventsCount: 3 });

      const newHeight = calculateMaxHeight(3, 800);
      expect(result.current.style.height).toBe(newHeight);
    });

    it('當收合時 eventsCount 變化，高度應維持 COLLAPSED_HEIGHT', () => {
      mockIsDrawerExpanded = false;
      const { result, rerender } = renderHook(({ eventsCount }) => useDrawer({ eventsCount }), {
        initialProps: { eventsCount: 1 },
      });

      expect(result.current.style.height).toBe(COLLAPSED_HEIGHT);

      rerender({ eventsCount: 3 });

      expect(result.current.style.height).toBe(COLLAPSED_HEIGHT);
    });
  });
});

describe('高度常數', () => {
  it('COLLAPSED_HEIGHT 應為 90', () => {
    expect(COLLAPSED_HEIGHT).toBe(90);
  });

  it('HANDLE_BAR_HEIGHT 應為 90', () => {
    expect(HANDLE_BAR_HEIGHT).toBe(90);
  });

  it('CARD_HEIGHT 應為 132', () => {
    expect(CARD_HEIGHT).toBe(132);
  });

  it('CARD_GAP 應為 16', () => {
    expect(CARD_GAP).toBe(16);
  });

  it('CONTENT_PADDING 應為 16', () => {
    expect(CONTENT_PADDING).toBe(16);
  });
});
