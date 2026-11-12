import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import type { FavoritesResponse } from '@/types';

export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: queryKey.favorites(userId),
    queryFn: async ({ signal }) => {
      const favorites: FavoritesResponse['favorites'] = [];
      let page = 1;
      let totalPages = 1;
      // shortcut: read existing API pages to build the complete list; use a dedicated API if large lists become slow.
      do {
        signal.throwIfAborted();
        const result = await usersApi.favorites.getAll({
          status: 'all',
          sort: 'favoritedAt',
          sortOrder: 'desc',
          limit: 100,
          page,
        });
        favorites.push(...result.favorites);
        totalPages = result.pagination.totalPages;
        page += 1;
      } while (page <= totalPages);
      return favorites;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
