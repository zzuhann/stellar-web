import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { MapEvent } from '@/types';

interface MapDataOptions {
  status?: 'active' | 'upcoming' | 'all';
  bounds?: string; // "lat1,lng1,lat2,lng2"
  center?: string; // "lat,lng" - 新增地圖中心點參數
  zoom?: number;
  // 篩選參數
  search?: string;
  artistId?: string;
  region?: string;
  enabled?: boolean;
}

interface MapDataResponse {
  events: MapEvent[];
  total: number;
}

export function useMapData(options: MapDataOptions = {}) {
  const { enabled = true, ...queryOptions } = options;
  return useQuery({
    queryKey: ['map-data', queryOptions],
    queryFn: async (): Promise<MapDataResponse> => {
      return eventsApi.getMapData({
        status: queryOptions.status,
        bounds: queryOptions.bounds,
        center: queryOptions.center,
        zoom: queryOptions.zoom,
        search: queryOptions.search?.trim(),
        artistId: queryOptions.artistId,
        region: queryOptions.region,
      });
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
