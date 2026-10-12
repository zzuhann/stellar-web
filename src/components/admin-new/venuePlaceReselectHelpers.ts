import axios from 'axios';

export type PlaceKind = 'store' | 'address' | 'unset' | 'other';

// Prefix rule is empirical (ChIJ = store, Ej/Ek = address); Google does not guarantee place ID format
export function getPlaceKind(placeId: string | null | undefined): {
  kind: PlaceKind;
  prefix: string;
} {
  if (!placeId) return { kind: 'unset', prefix: '' };
  const prefix = placeId.slice(0, 4);
  if (placeId.startsWith('ChIJ')) return { kind: 'store', prefix };
  if (placeId.startsWith('Ej') || placeId.startsWith('Ek')) return { kind: 'address', prefix };
  return { kind: 'other', prefix };
}

// Backend treats lat=lng=0 as "no coordinates"; a single 0 is a valid coordinate
export function hasMissingCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return true;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return true;
  return lat === 0 && lng === 0;
}

export interface ParsedReselectError {
  status?: number;
  code?: string;
  details?: unknown;
}

export function parsePlaceReselectError(err: unknown): ParsedReselectError {
  if (!axios.isAxiosError(err) || !err.response) return {};
  const data = err.response.data as { code?: string; details?: unknown } | undefined;
  return { status: err.response.status, code: data?.code, details: data?.details };
}
