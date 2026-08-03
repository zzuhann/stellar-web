'use client';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { ReactNode } from 'react';
import { QueryStateProvider, useQueryStateContext } from './useQueryStateContext';
import { useQueryState } from './useQueryState';

// ─── next/navigation mock ──────────────────────────────────────────────────────

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
  useSearchParams: () => currentSearchParams,
  usePathname: () => '/',
}));

let historyReplaceSpy: ReturnType<typeof vi.spyOn>;
let historyPushSpy: ReturnType<typeof vi.spyOn>;

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
    historyReplaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    historyPushSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
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

      expect(historyReplaceSpy).toHaveBeenCalledWith(null, '', '/?tab=events');
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

      expect(historyPushSpy).toHaveBeenCalled();
      expect(historyReplaceSpy).not.toHaveBeenCalled();
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
      expect(historyReplaceSpy).toHaveBeenCalledTimes(1);
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

      expect(historyReplaceSpy).toHaveBeenCalledTimes(1);
    });

    // Regression test：mergeUpdates 寫完 URL 後，router 的 searchParams mock（模擬
    // 真實瀏覽器中 next/navigation 的 searchParams 還沒跟上）維持不變。緊接著（例如
    // 使用者切換分頁）呼叫一次「獨立」的 setState，若還是直接讀 searchParams.toString()
    // 當底，就會讀到 mergeUpdates 寫入前的舊值，把剛合併寫入的欄位從 URL 洗掉 ——
    // 對應 VenuesClient.tsx 的 region/capacity 篩選後接著切換分頁的情境。
    it('mergeUpdates 之後緊接著呼叫獨立的 setState，兩次寫入的欄位都要留在最後一次 URL', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mergeUpdates(() => {
          result.current.setState('region', '台北');
          result.current.setState('capacity', '20-40');
        });
      });

      // 這裡刻意不呼叫 setMockSearchParams()：真實情境下 next/navigation 的
      // searchParams 要等 router 同步完才會反映剛才的 history.replaceState，
      // 這個測試模擬「還沒同步完」的那個時間窗。
      act(() => {
        result.current.setState('page', '2');
      });

      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');

      expect(search.get('region')).toBe('台北');
      expect(search.get('capacity')).toBe('20-40');
      expect(search.get('page')).toBe('2');

      // params（畫面讀取的來源）本來就是對的，這裡一併確認沒有跟著壞掉
      expect(result.current.params).toEqual({
        region: '台北',
        capacity: '20-40',
        page: '2',
      });
    });

    // Regression test for qa.md Phase 2.7「先切換地區、再切換容納人數、再切換分頁」：
    // region/capacity 現在完全獨立（2026-08-03 裁定推翻「切換地區重置容納人數」），
    // VenuesClient 的 handleRegionChange 與 handleCapacityChange 各自呼叫一次獨立的
    // mergeUpdates（不是合併成一次），緊接著切換分頁又是一次獨立的 setState —— 三次
    // 操作都在 router 的 searchParams 還沒跟上時發生，驗證 region/capacity 都不會被
    // 後續操作洗掉。
    it('先切換地區（mergeUpdates）、再切換容納人數（mergeUpdates）、再切換分頁（setState）：三次操作後 region/capacity 都還在 URL 上', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mergeUpdates(() => {
          result.current.setState('region', '台北');
          result.current.setState('page', null);
        });
      });

      act(() => {
        result.current.mergeUpdates(() => {
          result.current.setState('capacity', '20-40');
          result.current.setState('page', null);
        });
      });

      act(() => {
        result.current.setState('page', '2');
      });

      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');

      expect(search.get('region')).toBe('台北');
      expect(search.get('capacity')).toBe('20-40');
      expect(search.get('page')).toBe('2');
    });

    it('連續兩次獨立的 setState（searchParams 尚未同步）不應互相洗掉對方寫入的欄位', () => {
      const { result } = renderHook(() => useQueryStateContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setState('tab', 'events');
      });

      // 同樣不呼叫 setMockSearchParams()，模擬 router 尚未同步
      act(() => {
        result.current.setState('week', '2026-05-05');
      });

      const lastUrl = historyReplaceSpy.mock.calls.at(-1)?.[2] as string;
      const search = new URLSearchParams(lastUrl.split('?')[1] ?? '');

      expect(search.get('tab')).toBe('events');
      expect(search.get('week')).toBe('2026-05-05');
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
