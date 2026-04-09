const queryKey = {
  birthdayArtists: (startDate: string, endDate: string) => ['birthday-artists', startDate, endDate],
  weeklyEvents: (startDate: string, endDate: string) => ['weekly-events', startDate, endDate],
  trendingEvents: (limit: number) => ['trending-events', limit],
};

export default queryKey;
