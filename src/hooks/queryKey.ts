const queryKey = {
  birthdayArtists: (startDate: string, endDate: string) => ['birthday-artists', startDate, endDate],
  weeklyEvents: (startDate: string, endDate: string) => ['weekly-events', startDate, endDate],
  trendingEvents: (limit: number) => ['trending-events', limit],
  topArtists: (limit: number) => ['top-artists', limit],
  adminVenues: (...args: unknown[]) => ['admin-venues', ...args],
  venueDetail: (venueId: string) => ['venue-detail', venueId],
  venues: (params?: unknown) => ['venues', params],
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
