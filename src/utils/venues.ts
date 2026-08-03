import { REGIONS } from '@/constants';
import type { Venue } from '@/types';
import { CAPACITY_OPTIONS, type CapacityFilter } from '@/components/venues/venueCapacity';
import type { VenueSort } from '@/components/venues/VenueFilters';

/**
 * Derive the "regions that actually have venues" chip list from a full active-venue
 * list, ordered north-to-south per REGIONS (not alphabetically). Regions not present
 * in REGIONS (dirty data) are dropped. Always prefixes with '全部'.
 */
export function deriveVenueRegions(venues: Pick<Venue, 'region'>[]): string[] {
  const order: readonly string[] = REGIONS;
  const unique = Array.from(new Set(venues.map((v) => v.region))).filter((r) => order.includes(r));
  unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return ['全部', ...unique];
}

const VALID_SORT_VALUES: VenueSort[] = ['eventCount', 'newest'];

/**
 * Unknown/illegal `sort` URL values fall back to the default `newest`. This matches
 * what was actually live in production — design-frontend.md previously said the
 * default should be `eventCount`, but that was stale doc drift, never actually
 * shipped. 2026-08-03: doc corrected to match reality instead of reality being
 * changed to match the doc.
 */
export function parseVenueSort(value: string): VenueSort {
  return VALID_SORT_VALUES.includes(value as VenueSort) ? (value as VenueSort) : 'newest';
}

/** Unknown/illegal `capacity` URL values fall back to the default `all`. */
export function parseVenueCapacity(value: string): CapacityFilter {
  return CAPACITY_OPTIONS.some((opt) => opt.id === value) ? (value as CapacityFilter) : 'all';
}

const POSITIVE_INTEGER_PATTERN = /^\d+$/;

/**
 * Non-positive-integer `page` URL values fall back to 1. Requires a *pure* positive
 * integer string — parseInt would silently accept "2abc" (→ 2) or "1.5" (→ 1), which
 * is too lenient for a URL param that should either be a clean page number or absent.
 */
export function parseVenuePage(value: string): number {
  if (!POSITIVE_INTEGER_PATTERN.test(value)) return 1;
  const n = Number(value);
  return n >= 1 ? n : 1;
}
