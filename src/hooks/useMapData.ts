import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface MapDataOptions {
  status?: 'active' | 'upcoming' | 'all';
  bounds?: string; // "lat1,lng1,lat2,lng2"
  zoom?: number;
  // 新增篩選參數
  search?: string;
  artistId?: string;
  region?: string;
}

interface MapEvent {
  id: string;
  title: string;
  artistName: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'upcoming';
  thumbnail?: string;
}

interface MapDataResponse {
  events: MapEvent[];
  total: number;
}

export function useMapData(options: MapDataOptions = {}) {
  return useQuery({
    queryKey: ['map-data', options],
    queryFn: async (): Promise<MapDataResponse> => {
      const params = new URLSearchParams();

      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.bounds) params.append('bounds', options.bounds);
      if (options.zoom) params.append('zoom', options.zoom.toString());
      // 新增篩選參數
      if (options.search?.trim()) params.append('search', options.search.trim());
      if (options.artistId) params.append('artistId', options.artistId);
      if (options.region) params.append('region', options.region);

      const response = await api.get(`/events/map-data?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 分鐘快取（地圖資料更新頻率較低）
    enabled: true,
  });
}
