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
}

interface MapDataResponse {
  events: MapEvent[];
  total: number;
}

export function useMapData(options: MapDataOptions = {}) {
  return useQuery({
    queryKey: ['map-data', options],
    queryFn: async (): Promise<MapDataResponse> => {
      // 使用統一的 API 函數
      return eventsApi.getMapData({
        status: options.status,
        bounds: options.bounds,
        center: options.center, // 新增 center 支援
        zoom: options.zoom,
        search: options.search?.trim(),
        artistId: options.artistId,
        region: options.region,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 分鐘快取（地圖資料更新頻率較低）
    enabled: true,
  });
}
