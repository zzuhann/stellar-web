'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { trackResolveVenueGeolocation } from '@/lib/analytics/venues';
import { roundCoordinate, type Coordinates } from '@/utils/geo';

export type VenueGeolocationSource = 'menu_select' | 'share_link';

export type VenueGeolocationResolution =
  | { status: 'granted'; coords: Coordinates }
  | { status: 'denied' | 'unsupported' | 'timeout' };

// Module-level (not React state, not sessionStorage/localStorage): per requirements.md
// 「座標只存在前端記憶體」, coords survive component remounts within the same page load
// (e.g. client-side nav away from /venues and back) but are cleared by a full reload —
// which a plain JS module variable gives us for free, with no explicit cleanup needed.
let cachedCoords: Coordinates | null = null;
let pendingRequest: Promise<VenueGeolocationResolution> | null = null;

// Codex 第三輪 code review（情境 C）：原本用一般 useState 存 coords，`.then()` 裡的
// `setCoords` 只會更新「發起這次請求的那個 hook instance」。若使用者在定位 pending
// 期間離開 /venues 再回來，VenuesClient 整個卸載又重新掛載，新 instance 一開始讀到的
// `cachedCoords` 仍是 null（請求還沒成功），而稍後成功時，module 級 `cachedCoords`
// 確實被設定了，但沒有任何機制通知這個新 instance 重新讀取——它的 `coords` 永遠停在
// null，distance query 因此永遠 disabled、列表卡在 loading。
//
// 改用 useSyncExternalStore 把 coords 變成「訂閱同一份模組級狀態」，不論是哪個 instance
// 發起請求、也不論中途有幾個 instance 掛載/卸載，所有「當下還活著」的 instance 都會在
// `notifyListeners()` 被呼叫時統一重新讀取 `cachedCoords` 並 re-render。
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function subscribeToCoords(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 必須回傳穩定參考：兩次呼叫之間若 cachedCoords 沒被重新賦值，回傳同一個物件/null，
// useSyncExternalStore 才不會誤判「每次 render 都變了」而無限重渲染。這裡天然滿足
// ——cachedCoords 只在 requestGeolocation 的成功分支被整個重新賦值一次，不會被原地
// mutate。
function getCoordsSnapshot(): Coordinates | null {
  return cachedCoords;
}

// VenuesClient is a client component but Next.js still server-renders it for the
// initial HTML; useSyncExternalStore needs a server snapshot so that pass doesn't
// throw. A fresh server-side module instance never has resolved coords, so `null`
// always matches the real initial state — no hydration mismatch possible.
function getServerCoordsSnapshot(): Coordinates | null {
  return null;
}

/** Test-only escape hatch — Vitest reuses the module across test files/cases, so the
 * module-level cache above must be reset between tests that exercise this hook. */
export function __resetVenueDistanceSortCacheForTests(): void {
  cachedCoords = null;
  pendingRequest = null;
  listeners.clear();
}

const GEOLOCATION_TIMEOUT_MS = 10000;
// GeolocationPositionError.PERMISSION_DENIED — hardcoded rather than read off the error
// object, since mocked error objects in tests (and some browser polyfills) may not carry
// the named constants, only the numeric `code`.
const PERMISSION_DENIED_CODE = 1;

function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

function requestGeolocation(
  userId: string | undefined,
  source: VenueGeolocationSource
): Promise<VenueGeolocationResolution> {
  if (!isGeolocationSupported()) {
    trackResolveVenueGeolocation({ userId, locationResult: 'unsupported', source });
    return Promise.resolve({ status: 'unsupported' });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: roundCoordinate(position.coords.latitude),
          lng: roundCoordinate(position.coords.longitude),
        };
        cachedCoords = coords;
        // 在「真正的那次改變狀態」當下通知所有訂閱者，不是在某個特定 instance 的
        // promise .then() 裡——這樣不論哪個 instance 發起這次請求、中途有沒有其他
        // instance 卸載/掛載，所有當下活著的 instance 都會同步拿到新座標。
        notifyListeners();
        trackResolveVenueGeolocation({ userId, locationResult: 'granted', source });
        resolve({ status: 'granted', coords });
      },
      (error) => {
        const locationResult = error.code === PERMISSION_DENIED_CODE ? 'denied' : 'timeout';
        trackResolveVenueGeolocation({ userId, locationResult, source });
        resolve({ status: locationResult });
      },
      { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 }
    );
  });
}

interface UseVenueDistanceSortResult {
  /** Rounded coords cached for this browse session, or null if never resolved. */
  coords: Coordinates | null;
  /**
   * Resolves the user's location for the "distance" sort. Returns cached coords
   * immediately (no browser call, no GA event) if already resolved this session;
   * dedupes concurrent calls onto the same in-flight request (no duplicate permission
   * prompt). Always fires `resolve_venue_geolocation` exactly once per real browser
   * call, regardless of whether the caller is still around/interested by the time it
   * resolves (tracking.md: the event measures the permission grant itself, not UI).
   */
  resolveGeolocation: (
    userId: string | undefined,
    source: VenueGeolocationSource
  ) => Promise<VenueGeolocationResolution>;
}

export function useVenueDistanceSort(): UseVenueDistanceSortResult {
  const coords = useSyncExternalStore(
    subscribeToCoords,
    getCoordsSnapshot,
    getServerCoordsSnapshot
  );

  const resolveGeolocation = useCallback(
    (userId: string | undefined, source: VenueGeolocationSource) => {
      if (cachedCoords) {
        return Promise.resolve<VenueGeolocationResolution>({
          status: 'granted',
          coords: cachedCoords,
        });
      }
      if (pendingRequest) {
        return pendingRequest;
      }

      const promise = requestGeolocation(userId, source).then((result) => {
        pendingRequest = null;
        return result;
      });
      pendingRequest = promise;
      return promise;
    },
    []
  );

  return { coords, resolveGeolocation };
}
