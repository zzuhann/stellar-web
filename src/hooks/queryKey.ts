interface MapDataKeyOptions {
  status?: 'active' | 'upcoming' | 'all';
  bounds?: string;
  center?: string;
  zoom?: number;
  search?: string;
  artistId?: string;
  region?: string;
}

// Single normalization for the cache key and the API request: defaults filled,
// undefined dropped (an explicit `status: undefined` must not beat the default), search trimmed
export function normalizeMapDataOptions(options: MapDataKeyOptions): MapDataKeyOptions {
  const defined = Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined)
  ) as MapDataKeyOptions;
  return { status: 'all', ...defined, search: defined.search?.trim() ?? '' };
}

const queryKey = {
  // Shared by map page prefetch, useMapData and the overview page: a mismatch silently
  // leaves the server HTML without cards while the page still looks fine
  mapData: (options: MapDataKeyOptions) => ['map-data', normalizeMapDataOptions(options)],
  birthdayArtists: (startDate: string, endDate: string) => ['birthday-artists', startDate, endDate],
  weeklyEvents: (startDate: string, endDate: string) => ['weekly-events', startDate, endDate],
  trendingEvents: (limit: number) => ['trending-events', limit],
  topArtists: (limit: number) => ['top-artists', limit],
  homeVenues: (limit: number) => ['home-venues', limit],
  adminVenues: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    params !== undefined ? ['admin-venues', params] : ['admin-venues'],
  venueDetail: (venueId: string) => ['venue-detail', venueId],
  venueTagDictionary: () => ['venue-tag-dictionary'],
  // Separate from the admin key: the card query has its own retry and timeout
  venueCardTagDictionary: () => ['venue-card-tag-dictionary'],
  venues: (params?: {
    region?: string;
    capacityRange?: string;
    search?: string;
    sort?: string;
    page?: number;
    // Only present when sort='distance' (venue-distance-sort) — included so paging/
    // filtering while coords are cached still produces a fresh cache entry per request.
    lat?: number;
    lng?: number;
  }) => ['venues', params],
  artistEvents: (artistId: string) => ['artist-events', artistId],
  adminEvents: (params: {
    search?: string;
    slug?: string;
    id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => ['admin-events', params],
  adminArtists: (params: {
    search?: string;
    slug?: string;
    id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => ['admin-artists', params],
};

export default queryKey;
