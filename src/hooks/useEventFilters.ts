import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CoffeeEvent } from '@/types';

interface FilterOptions {
  search: string;
  artistId: string;
  status: 'all' | 'active' | 'upcoming' | 'ended';
  region: string;
  page?: number;
  limit?: number;
}

interface EventsResponse {
  events: CoffeeEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    artistId?: string;
    status?: string;
    region?: string;
  };
}

export function useEventFilters(filters: FilterOptions) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async (): Promise<EventsResponse> => {
      const params = new URLSearchParams();

      // 只添加有值的參數
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.artistId) params.append('artistId', filters.artistId);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.region) params.append('region', filters.region);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/events?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 分鐘快取
    enabled: true,
  });
}
