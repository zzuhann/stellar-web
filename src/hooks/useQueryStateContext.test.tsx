'use client';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { ReactNode } from 'react';
import { QueryStateProvider, useQueryStateContext } from './useQueryStateContext';
import { useQueryState } from './useQueryState';

// ─── next/navigation mock ──────────────────────────────────────────────────────

const mockReplace = vi.fn();
const mockPush = vi.fn();

function createSearchParamsMock(entries: [string, string][]) {
  return {
    get: (key: string) => entries.find(([k]) => k === key)?.[1] ?? null,
    forEach: (cb: (value: string, key: string) => void) => {
      entries.forEach(([key, value]) => cb(value, key));
    },
    toString: () => entries.map(([k, v]) => `${k}=${v}`).join('&'),
  };
}

// 穩定 reference，避免 useEffect([searchParams]) 每次 render 都觸發
let currentSearchParams = createSearchParamsMock([]);

function setMockSearchParams(entries: [string, string][]) {
  currentSearchParams = createSearchParamsMock(entries);
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => currentSearchParams,
  usePathname: () => '/',
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryStateProvider>{children}</QueryStateProvider>;
  };
}

// ─── QueryStateProvider ───────────────────────────────────────────────────────

describe('QueryStateProvider', () => {
  beforeEach(() => {
    setMockSearchParams([]);
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('params 應從 searchParams 初始化', () => {
      setMockSearchParams([
        ['tab', 'birthday'],
        ['week', '2026-04-28'],
      ]);

      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.params).toEqual({
        tab: 'birthday',
        week: '2026-04-28',
      });
    });

    it('沒有 searchParams 時 params 應為空物件', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.params).toEqual({});
    });
  });

  describe('setState', () => {
    it('呼叫後應立即更新 params（不依賴 URL 回調，確保 in-app browser 正常）', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('tab', 'events');
      });

      expect(result.current.params.tab).toBe('events');
    });

    it('應同時呼叫 router.replace 更新 URL', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('tab', 'events');
      });

      expect(mockReplace).toHaveBeenCalledWith('/?tab=events', { scroll: false });
    });

    it('value 為 null 時應從 params 刪除該 key', () => {
      setMockSearchParams([['tab', 'birthday']]);

      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('tab', null);
      });

      expect(result.current.params.tab).toBeUndefined();
    });

    it('多次呼叫應累積更新 params', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('tab', 'events');
      });

      act(() => {
        result.current.setState('week', '2026-05-05');
      });

      expect(result.current.params.tab).toBe('events');
      expect(result.current.params.week).toBe('2026-05-05');
    });

    it('Date 值應序列化為 YYYY-MM-DD 格式', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('week', new Date(2026, 3, 28)); // 2026-04-28
      });

      expect(result.current.params.week).toBe('2026-04-28');
    });

    it('method 為 push 時應呼叫 router.push', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('tab', 'events', { method: 'push' });
      });

      expect(mockPush).toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('mergeUpdates', () => {
    it('應批次更新多個 params，只觸發一次 router.replace', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mergeUpdates(() => {
          result.current.setState('tab', 'events');
          result.current.setState('week', '2026-05-05');
        });
      });

      expect(result.current.params.tab).toBe('events');
      expect(result.current.params.week).toBe('2026-05-05');
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it('mergeUpdates 完成後 shouldMerge 應重置（單獨 setState 應正常觸發 URL 更新）', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mergeUpdates(() => {
          result.current.setState('tab', 'events');
        });
      });

      vi.clearAllMocks();

      act(() => {
        result.current.setState('tab', 'birthday');
      });

      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
  });

  describe('URL 外部變化同步（瀏覽器上下頁）', () => {
    it('searchParams reference 改變時應同步更新 params', () => {
      setMockSearchParams([['tab', 'birthday']]);

      const { result, rerender } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.params.tab).toBe('birthday');

      // 模擬瀏覽器上下頁，URL 從外部變化
      act(() => {
        setMockSearchParams([['tab', 'events']]);
        rerender();
      });

      expect(result.current.params.tab).toBe('events');
    });

    it('URL 清空時 params 應清空', () => {
      setMockSearchParams([['tab', 'birthday']]);

      const { result, rerender } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        setMockSearchParams([]);
        rerender();
      });

      expect(result.current.params.tab).toBeUndefined();
    });
  });
});

// ─── useQueryState ────────────────────────────────────────────────────────────

describe('useQueryState', () => {
  beforeEach(() => {
    setMockSearchParams([]);
    vi.clearAllMocks();
  });

  it('param 不存在時應回傳 defaultValue', () => {
    const { result } = renderHook(
      () => useQueryState('tab', { defaultValue: 'birthday' as const }),
      { wrapper: createWrapper() }
    );

    expect(result.current[0]).toBe('birthday');
  });

  it('param 存在時應回傳解析後的值', () => {
    setMockSearchParams([['tab', 'events']]);

    const { result } = renderHook(
      () =>
        useQueryState('tab', {
          defaultValue: 'birthday' as 'birthday' | 'events',
          parse: (v) => (v === 'birthday' || v === 'events' ? v : 'birthday'),
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current[0]).toBe('events');
  });

  it('setValue 後應立即反映新值，不等待 URL 更新（in-app browser / PWA 修復核心）', () => {
    const { result } = renderHook(
      () =>
        useQueryState('tab', {
          defaultValue: 'birthday' as 'birthday' | 'events',
          parse: (v) => (v === 'birthday' || v === 'events' ? v : 'birthday'),
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current[0]).toBe('birthday');

    act(() => {
      result.current[1]('events');
    });

    expect(result.current[0]).toBe('events');
  });

  it('setValue 傳入 null 時應回退至 defaultValue', () => {
    setMockSearchParams([['tab', 'events']]);

    const { result } = renderHook(
      () =>
        useQueryState('tab', {
          defaultValue: 'birthday' as 'birthday' | 'events',
          parse: (v) => (v === 'birthday' || v === 'events' ? v : 'birthday'),
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current[0]).toBe('events');

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe('birthday');
  });
});
