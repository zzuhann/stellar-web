import { useQuery } from '@tanstack/react-query';
import { artistsApi, eventsApi } from '@/lib/api';
import queryKey from './queryKey';

export const useBirthdayArtistsQuery = (
  startDate: string,
  endDate: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKey.birthdayArtists(startDate, endDate),
    queryFn: () =>
      artistsApi.getAll({
        status: 'approved',
        birthdayStartDate: startDate,
        birthdayEndDate: endDate,
        sortBy: 'coffeeEventCount',
        sortOrder: 'desc',
      }),
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
    enabled: options?.enabled,
  });
};

export const useTrendingEventsQuery = (limit = 10) => {
  return useQuery({
    queryKey: queryKey.trendingEvents(limit),
    queryFn: () => eventsApi.getTrending(limit),
    staleTime: 1000 * 60 * 60 * 6, // 6 小時，對應後端 cache TTL
    gcTime: 1000 * 60 * 60 * 7,
    select: (data) => data.events,
  });
};

export const useWeeklyEventsQuery = (
  startDate: string,
  endDate: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKey.weeklyEvents(startDate, endDate),
    queryFn: () =>
      eventsApi.getAll({
        status: 'approved',
        startTimeFrom: startDate,
        startTimeTo: endDate,
        sortBy: 'startTime',
        sortOrder: 'asc',
      }),
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
    enabled: options?.enabled,
  });
};
