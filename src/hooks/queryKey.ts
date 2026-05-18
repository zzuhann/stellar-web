const queryKey = {
  birthdayArtists: (startDate: string, endDate: string) => ['birthday-artists', startDate, endDate],
  weeklyEvents: (startDate: string, endDate: string) => ['weekly-events', startDate, endDate],
  trendingEvents: (limit: number) => ['trending-events', limit],
  topArtists: (limit: number) => ['top-artists', limit],
  adminVenues: (...args: unknown[]) => ['admin-venues', ...args],
  venueDetail: (venueId: string) => ['venue-detail', venueId],
};

export default queryKey;
