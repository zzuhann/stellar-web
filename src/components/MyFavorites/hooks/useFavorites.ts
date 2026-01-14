import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { FavoriteFilterParams } from '@/types';

export const useFavorites = (filters: FavoriteFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['favorites', filters],
    queryFn: () => usersApi.favorites.getAll(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
};
