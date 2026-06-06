import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBottomSheet } from './useBottomSheet';

const PEEK_HEIGHT = 120;
const VIEWPORT_HEIGHT = 800;

describe('useBottomSheet', () => {
  beforeEach(() => {
    vi.stubGlobal('innerHeight', VIEWPORT_HEIGHT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('初始狀態', () => {
    it('初始高度應為 PEEK_HEIGHT（120px），isHalfOpen 為 false', () => {
      const { result } = renderHook(() => useBottomSheet({}));
      expect(result.current.height).toBe(PEEK_HEIGHT);
      expect(result.current.isHalfOpen).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TC-024：拖曳位移邊界判定（< 10px 視為 tap，= 10px 視為拖曳）
  // ─────────────────────────────────────────────────────────────
  describe('TC-024：10px 拖曳邊界判定', () => {
    it('位移 0px（純 tap）從 peek 應切換到 half-open', () => {
      const { result } = renderHook(() => useBottomSheet({}));

      act(() => {
        result.current.handleBarBind.onMouseDown({
          clientY: 500,
        } as React.MouseEvent);
      });
      // No mousemove dispatched → dragDistance = 0
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      // 0 < 10 → treated as tap → peek → half-open
      expect(result.current.height).toBeGreaterThan(PEEK_HEIGHT);
      expect(result.current.isHalfOpen).toBe(true);
    });

    it('位移 9px 仍視為 tap，從 peek 切換到 half-open', () => {
      const { result } = renderHook(() => useBottomSheet({}));

      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 491 }));
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      // |height - PEEK_HEIGHT| = 9 < 10 → tap → go to half-open
      expect(result.current.isHalfOpen).toBe(true);
    });

    it('位移 = 10px 視為拖曳（非 tap），不會跳到 half-open', () => {
      const { result } = renderHook(() => useBottomSheet({}));

      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      // Move exactly 10px upward → newHeight = 120 + 10 = 130
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 490 }));
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      // dragDistance = |130 - 120| = 10, NOT < 10 → drag snap
      // midPoint = 120 + (440 - 120) * 0.5 = 280；130 < 280 → snap to peek
      expect(result.current.height).toBe(PEEK_HEIGHT);
      expect(result.current.isHalfOpen).toBe(false);
    });

    it('位移 > 10px 的拖曳，若超出中點則 snap 到 half-open', () => {
      const { result } = renderHook(() => useBottomSheet({}));

      // halfHeight = round(800 * 0.55) = 440
      // midPoint = 120 + (440 - 120) * 0.5 = 280
      // Need height > 280 → deltaY > 160
      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 300 })); // delta = 200
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      // newHeight = 120 + 200 = 320 > midPoint 280 → snap to half-open (440)
      expect(result.current.height).toBe(Math.round(VIEWPORT_HEIGHT * 0.55));
      expect(result.current.isHalfOpen).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TC-025：Bottom Sheet 高度不超過 85vh
  // ─────────────────────────────────────────────────────────────
  describe('TC-025：Bottom Sheet 高度上限為 85vh', () => {
    it('halfHeight prop 超過 85vh 時，height 被截斷至 85vh', () => {
      const maxAllowed = Math.round(VIEWPORT_HEIGHT * 0.85); // 680
      const oversizedContent = 900; // > 85vh

      const { result } = renderHook(() => useBottomSheet({ halfHeight: oversizedContent }));

      // Tap to go to half-open
      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      expect(result.current.height).toBe(maxAllowed);
      expect(result.current.height).toBeLessThanOrEqual(maxAllowed);
    });

    it('halfHeight prop 在 85vh 以內時，使用實際 content 高度', () => {
      const contentHeight = 400; // < 85vh (680)

      const { result } = renderHook(() => useBottomSheet({ halfHeight: contentHeight }));

      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      expect(result.current.height).toBe(contentHeight);
    });

    it('halfHeight prop 恰好等於 85vh 時，不被截斷', () => {
      const exactly85 = Math.round(VIEWPORT_HEIGHT * 0.85); // 680

      const { result } = renderHook(() => useBottomSheet({ halfHeight: exactly85 }));

      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      expect(result.current.height).toBe(exactly85);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TC-026：快速連續 tap（狀態正確切換，不卡住）
  // ─────────────────────────────────────────────────────────────
  describe('TC-026：快速連續 tap', () => {
    const simulateTap = (
      result: ReturnType<
        typeof renderHook<ReturnType<typeof useBottomSheet>, Parameters<typeof useBottomSheet>[0]>
      >['result']
    ) => {
      act(() => {
        result.current.handleBarBind.onMouseDown({ clientY: 500 } as React.MouseEvent);
      });
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });
    };

    it('連續 tap 3 次後，狀態應為 half-open（peek→half→peek→half）', () => {
      const { result } = renderHook(() => useBottomSheet({}));

      simulateTap(result); // peek → half-open
      expect(result.current.isHalfOpen).toBe(true);

      simulateTap(result); // half-open → peek
      expect(result.current.isHalfOpen).toBe(false);

      simulateTap(result); // peek → half-open
      expect(result.current.isHalfOpen).toBe(true);
    });

    it('連續 tap 4 次後，應回到 peek 狀態', () => {
      const { result } = renderHook(() => useBottomSheet({}));

      simulateTap(result); // peek → half
      simulateTap(result); // half → peek
      simulateTap(result); // peek → half
      simulateTap(result); // half → peek

      expect(result.current.isHalfOpen).toBe(false);
      expect(result.current.height).toBe(PEEK_HEIGHT);
    });
  });
});
