const EARTH_RADIUS_METERS = 6371000;

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Straight-line distance between two points in meters (Haversine formula).
 * Mirrors `stellar/src/utils/geo.ts` haversineDistanceMeters — kept as an independent
 * pure function per-runtime (frontend/backend are separate processes), not shared code.
 */
export function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Venue coordinates are treated as missing when lat/lng are null/undefined, non-finite
 * (NaN/Infinity), or both are exactly 0 (the "null island" placeholder used by the
 * backend's data layer). Mirrors `stellar/src/utils/geo.ts` isMissingVenueCoords
 * exactly — this rule is a front/back contract, not an implementation detail: only one
 * side being 0 (e.g. lat=0, lng=121.5) is a valid coordinate, not a missing one.
 */
export function isMissingVenueCoords(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  if (lat == null || lng == null) return true;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
  return lat === 0 && lng === 0;
}

/**
 * Rounds a raw browser coordinate to 3 decimal places (~100m precision), per
 * requirements.md's privacy rule. The SAME rounded value must be used both for the
 * `sort=distance` API request and for the card's own displayed distance (design-
 * frontend.md「計算用的座標必須與送給後端排序的座標是同一組」) — never the raw,
 * unrounded browser coordinate for display.
 */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}
