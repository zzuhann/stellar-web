import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';

export const useArtistSearch = (query: string) => {
  const trimmedQuery = query.trim();

  return useQuery({
    queryKey: ['artist-search', trimmedQuery],
    queryFn: () => {
      const filter = {
        status: 'approved' as const,
        search: trimmedQuery,
        sortBy: 'coffeeEventCount' as const,
        sortOrder: 'desc' as const,
      };

      return artistsApi.getAll(filter);
    },
    enabled: trimmedQuery.length > 0, // 只有當有搜尋關鍵字時才執行
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
  });
};

export const useMonthlyBirthdayArtists = ({
  startDate,
  endDate,
  today,
  enabled,
}: {
  startDate: string;
  endDate: string;
  today: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['monthly-birthday-artists', startDate, endDate],
    queryFn: () =>
      artistsApi.getAll({
        status: 'approved',
        birthdayStartDate: today,
        birthdayEndDate: endDate,
      }),
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
    enabled,
  });
};
