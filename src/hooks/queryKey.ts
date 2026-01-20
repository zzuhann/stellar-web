const queryKey = {
  birthdayArtists: (startDate: string, endDate: string) => ['birthday-artists', startDate, endDate],
  weeklyEvents: (startDate: string, endDate: string) => ['weekly-events', startDate, endDate],
};

export default queryKey;
