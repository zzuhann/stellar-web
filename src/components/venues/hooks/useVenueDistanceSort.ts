'use client';

import { useCallback, useState } from 'react';
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

/** Test-only escape hatch — Vitest reuses the module across test files/cases, so the
 * module-level cache above must be reset between tests that exercise this hook. */
export function __resetVenueDistanceSortCacheForTests(): void {
  cachedCoords = null;
  pendingRequest = null;
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
  const [coords, setCoords] = useState<Coordinates | null>(cachedCoords);

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
        if (result.status === 'granted') {
          setCoords(result.coords);
        }
        return result;
      });
      pendingRequest = promise;
      return promise;
    },
    []
  );

  return { coords, resolveGeolocation };
}
