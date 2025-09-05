import { useQuery } from '@tanstack/react-query';
import { Artist } from '@/types';
import { artistsApi, eventsApi } from '@/lib/api';

export const useBirthdayArtists = (
  startDate: string,
  endDate: string,
  placeholderData?: Artist[],
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['birthday-artists', startDate, endDate],
    queryFn: () =>
      artistsApi.getAll({
        status: 'approved',
        birthdayStartDate: startDate,
        birthdayEndDate: endDate,
        sortBy: 'coffeeEventCount',
        sortOrder: 'desc',
      }),
    placeholderData: placeholderData,
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
    enabled: options?.enabled,
  });
};

export const useWeeklyEvents = (
  startDate: string,
  endDate: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['weekly-events', startDate, endDate],
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
