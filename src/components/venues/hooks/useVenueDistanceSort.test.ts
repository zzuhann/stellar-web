import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackResolveVenueGeolocation } from '@/lib/analytics/venues';
import {
  __resetVenueDistanceSortCacheForTests,
  useVenueDistanceSort,
} from './useVenueDistanceSort';

vi.mock('@/lib/analytics/venues', () => ({
  trackResolveVenueGeolocation: vi.fn(),
}));

type GeolocationSuccessCallback = (position: {
  coords: { latitude: number; longitude: number };
}) => void;
type GeolocationErrorCallback = (error: { code: number }) => void;

function stubGeolocation() {
  const getCurrentPosition = vi.fn();
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
  return getCurrentPosition;
}

function stubUnsupportedGeolocation() {
  // 'geolocation' in navigator must be false, not just undefined — replace the whole
  // navigator object (per design-frontend.md「技術落差」/ qa.md 情境 31 的既有結論).
  vi.stubGlobal('navigator', {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  __resetVenueDistanceSortCacheForTests();
});

beforeEach(() => {
  __resetVenueDistanceSortCacheForTests();
});

describe('useVenueDistanceSort — 定位成功', () => {
  it('成功時回傳 rounded 座標並快取，之後 coords 可讀', async () => {
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.0330123, longitude: 121.5644999 } });
    });

    const { result } = renderHook(() => useVenueDistanceSort());

    let resolution;
    await act(async () => {
      resolution = await result.current.resolveGeolocation('user-1', 'menu_select');
    });

    expect(resolution).toEqual({ status: 'granted', coords: { lat: 25.033, lng: 121.564 } });
    expect(trackResolveVenueGeolocation).toHaveBeenCalledWith({
      userId: 'user-1',
      locationResult: 'granted',
      source: 'menu_select',
    });

    await waitFor(() => {
      expect(result.current.coords).toEqual({ lat: 25.033, lng: 121.564 });
    });
  });

  it('已快取座標時，再次呼叫不會呼叫 getCurrentPosition，也不會重送事件', async () => {
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });

    const { result } = renderHook(() => useVenueDistanceSort());
    await act(async () => {
      await result.current.resolveGeolocation('user-1', 'menu_select');
    });

    getCurrentPosition.mockClear();
    vi.mocked(trackResolveVenueGeolocation).mockClear();

    const second = await result.current.resolveGeolocation('user-1', 'menu_select');

    expect(second).toEqual({ status: 'granted', coords: { lat: 25.033, lng: 121.564 } });
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(trackResolveVenueGeolocation).not.toHaveBeenCalled();
  });

  it('不同 hook instance（模擬元件重新掛載）仍讀到同一份模組級快取座標', async () => {
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((success: GeolocationSuccessCallback) => {
      success({ coords: { latitude: 25.033, longitude: 121.564 } });
    });

    const first = renderHook(() => useVenueDistanceSort());
    await act(async () => {
      await first.result.current.resolveGeolocation('user-1', 'menu_select');
    });
    first.unmount();

    const second = renderHook(() => useVenueDistanceSort());
    expect(second.result.current.coords).toEqual({ lat: 25.033, lng: 121.564 });
  });
});

describe('useVenueDistanceSort — 定位失敗', () => {
  it('PERMISSION_DENIED（code 1） → denied', async () => {
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((_s: unknown, error: GeolocationErrorCallback) => {
      error({ code: 1 });
    });

    const { result } = renderHook(() => useVenueDistanceSort());
    let resolution;
    await act(async () => {
      resolution = await result.current.resolveGeolocation('user-1', 'menu_select');
    });

    expect(resolution).toEqual({ status: 'denied' });
    expect(trackResolveVenueGeolocation).toHaveBeenCalledWith({
      userId: 'user-1',
      locationResult: 'denied',
      source: 'menu_select',
    });
    expect(result.current.coords).toBeNull();
  });

  it('POSITION_UNAVAILABLE（code 2）與 TIMEOUT（code 3）皆歸為 timeout', async () => {
    for (const code of [2, 3]) {
      __resetVenueDistanceSortCacheForTests();
      vi.clearAllMocks();
      const getCurrentPosition = stubGeolocation();
      getCurrentPosition.mockImplementation((_s: unknown, error: GeolocationErrorCallback) => {
        error({ code });
      });

      const { result } = renderHook(() => useVenueDistanceSort());
      let resolution;
      await act(async () => {
        resolution = await result.current.resolveGeolocation('user-1', 'menu_select');
      });

      expect(resolution).toEqual({ status: 'timeout' });
      expect(trackResolveVenueGeolocation).toHaveBeenCalledWith({
        userId: 'user-1',
        locationResult: 'timeout',
        source: 'menu_select',
      });
    }
  });

  it('瀏覽器不支援 geolocation：不呼叫 getCurrentPosition，直接回傳 unsupported', async () => {
    stubUnsupportedGeolocation();
    expect('geolocation' in navigator).toBe(false);

    const { result } = renderHook(() => useVenueDistanceSort());
    const resolution = await result.current.resolveGeolocation('user-1', 'share_link');

    expect(resolution).toEqual({ status: 'unsupported' });
    expect(trackResolveVenueGeolocation).toHaveBeenCalledWith({
      userId: 'user-1',
      locationResult: 'unsupported',
      source: 'share_link',
    });
  });

  it('失敗後不快取座標，下次呼叫會重新請求', async () => {
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((_s: unknown, error: GeolocationErrorCallback) => {
      error({ code: 1 });
    });

    const { result } = renderHook(() => useVenueDistanceSort());
    await act(async () => {
      await result.current.resolveGeolocation('user-1', 'menu_select');
    });

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.resolveGeolocation('user-1', 'menu_select');
    });

    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });
});

// Codex 第三輪 code review（情境 C）：定位 pending 中離頁再返回（元件卸載又重新掛載），
// 新 instance 要正確同步到同一份請求的最終結果，不論成功或失敗。
describe('useVenueDistanceSort — pending 中卸載又重新掛載', () => {
  it('舊 instance 發起請求後卸載，新 instance 掛載並沿用同一個 pending promise，成功後新 instance 的 coords 要更新', async () => {
    let capturedSuccess: GeolocationSuccessCallback | undefined;
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((success: GeolocationSuccessCallback) => {
      capturedSuccess = success;
    });

    const first = renderHook(() => useVenueDistanceSort());
    const firstPromise = first.result.current.resolveGeolocation('user-1', 'menu_select');
    first.unmount();

    // 新 instance 掛載時，請求仍在 pending（尚未呼叫 capturedSuccess），coords 應為 null。
    const second = renderHook(() => useVenueDistanceSort());
    expect(second.result.current.coords).toBeNull();

    // 新 instance 沿用同一個 in-flight 請求（不重複呼叫 getCurrentPosition）。
    const secondPromise = second.result.current.resolveGeolocation('user-1', 'menu_select');
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    act(() => {
      capturedSuccess?.({ coords: { latitude: 25.033, longitude: 121.564 } });
    });
    await Promise.all([firstPromise, secondPromise]);

    // 關鍵斷言：新 instance（仍活著）的 coords 要同步更新，不能永遠停在 null。
    await waitFor(() => {
      expect(second.result.current.coords).toEqual({ lat: 25.033, lng: 121.564 });
    });
  });

  it('舊 instance 發起請求後卸載，新 instance 掛載並沿用同一個 pending promise，失敗時新 instance 也拿到正確的失敗結果', async () => {
    let capturedError: GeolocationErrorCallback | undefined;
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation(
      (_success: GeolocationSuccessCallback, error: GeolocationErrorCallback) => {
        capturedError = error;
      }
    );

    const first = renderHook(() => useVenueDistanceSort());
    first.result.current.resolveGeolocation('user-1', 'menu_select');
    first.unmount();

    const second = renderHook(() => useVenueDistanceSort());
    const secondPromise = second.result.current.resolveGeolocation('user-1', 'menu_select');
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    act(() => {
      capturedError?.({ code: 1 });
    });

    const result = await secondPromise;
    expect(result).toEqual({ status: 'denied' });
    expect(second.result.current.coords).toBeNull();
  });
});

describe('useVenueDistanceSort — 進行中的請求去重', () => {
  it('第一次呼叫尚未 resolve 時再次呼叫，沿用同一個 in-flight promise，不重複呼叫 getCurrentPosition', async () => {
    let capturedSuccess: GeolocationSuccessCallback | undefined;
    const getCurrentPosition = stubGeolocation();
    getCurrentPosition.mockImplementation((success: GeolocationSuccessCallback) => {
      capturedSuccess = success;
    });

    const { result } = renderHook(() => useVenueDistanceSort());

    const firstPromise = result.current.resolveGeolocation('user-1', 'menu_select');
    const secondPromise = result.current.resolveGeolocation('user-1', 'menu_select');

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    act(() => {
      capturedSuccess?.({ coords: { latitude: 25.033, longitude: 121.564 } });
    });

    const [first, second] = await Promise.all([firstPromise, secondPromise]);
    expect(first).toEqual(second);
    expect(trackResolveVenueGeolocation).toHaveBeenCalledTimes(1);
  });
});
