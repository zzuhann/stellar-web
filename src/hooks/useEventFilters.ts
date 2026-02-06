import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { CoffeeEvent, EventSearchParams } from '@/types';

interface FilterOptions {
  search?: string;
  artistId?: string;
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  region?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'startTime' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  startTimeFrom?: string;
  startTimeTo?: string;
}

export interface EventsResponse {
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
    queryFn: async (): Promise<CoffeeEvent[]> => {
      const params: EventSearchParams = {};

      // 只添加有值的參數
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
      if (filters.artistId) params.artistId = filters.artistId;
      if (filters.status) params.status = filters.status;
      if (filters.region) params.region = filters.region;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.startTimeFrom) params.startTimeFrom = filters.startTimeFrom;
      if (filters.startTimeTo) params.startTimeTo = filters.startTimeTo;

      const response = await eventsApi.getAll(params);
      return response.events;
    },
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
  });
}
