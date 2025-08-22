import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';

export const useArtistSearch = (query: string, includeStats: boolean = true) => {
  const trimmedQuery = query.trim();

  return useQuery({
    queryKey: ['artist-search', trimmedQuery],
    queryFn: () => {
      const includeStatsFiler = {
        status: 'approved' as const,
        search: trimmedQuery,
        includeStats: true,
        sortBy: 'coffeeEventCount' as const,
        sortOrder: 'desc' as const,
      };

      const noIncludeStatsFiler = {
        status: 'approved' as const,
        search: trimmedQuery,
      };

      return artistsApi.getAll(includeStats ? includeStatsFiler : noIncludeStatsFiler);
    },
    enabled: trimmedQuery.length > 0, // 只有當有搜尋關鍵字時才執行
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
  });
};
