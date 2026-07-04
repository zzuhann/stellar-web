import axios from 'axios';
import {
  CoffeeEvent,
  EventSearchParams,
  EventsResponse,
  MapDataResponse,
  CreateEventRequest,
  UpdateEventRequest,
  RejectRequest,
  TrendingEventsResponse,
} from '@/types';
import api from './client';

// 活動相關 API
export const eventsApi = {
  // 取得活動列表（支援新的查詢參數）
  getAll: async (params?: EventSearchParams) => {
    const queryParams: Record<string, string> = { checkFavorite: 'true' };

    if (params?.search) queryParams.search = params.search;
    if (params?.artistId) queryParams.artistId = params.artistId;
    if (params?.status) queryParams.status = params.status;
    if (params?.region) queryParams.region = params.region;
    if (params?.createdBy) queryParams.createdBy = params.createdBy;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
    if (params?.startTimeFrom) queryParams.startTimeFrom = params.startTimeFrom;
    if (params?.startTimeTo) queryParams.startTimeTo = params.startTimeTo;

    const response = await api.get<EventsResponse>('/events', { params: queryParams });
    return response.data;
  },

  // 取得地圖資料
  getMapData: async (params?: {
    status?: 'active' | 'upcoming' | 'all';
    bounds?: string;
    center?: string; // 新增：地圖中心點 "lat,lng"
    zoom?: number;
    search?: string;
    artistId?: string;
    region?: string;
  }) => {
    const queryParams: Record<string, string> = {};

    if (params?.status) queryParams.status = params.status;
    if (params?.bounds) queryParams.bounds = params.bounds;
    if (params?.center) queryParams.center = params.center; // 新增 center 參數
    if (params?.zoom) queryParams.zoom = params.zoom.toString();
    if (params?.search) queryParams.search = params.search;
    if (params?.artistId) queryParams.artistId = params.artistId;
    if (params?.region) queryParams.region = params.region;

    const response = await api.get<MapDataResponse>('/events/map-data', { params: queryParams });
    return response.data;
  },

  // 搜尋活動
  search: async (params: { query?: string; artistName?: string; location?: string }) => {
    const response = await api.get<CoffeeEvent[]>('/events/search', { params });
    return response.data;
  },

  // 取得單一活動詳情
  getById: async (id: string) => {
    try {
      const response = await api.get<CoffeeEvent | null>(`/events/${id}`, {
        params: { checkFavorite: 'true' },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // 建立活動
  create: async (eventData: CreateEventRequest) => {
    const response = await api.post<CoffeeEvent>('/events', eventData);
    return response.data;
  },

  // 編輯活動
  update: async (id: string, updateData: UpdateEventRequest) => {
    const response = await api.put<CoffeeEvent>(`/events/${id}`, updateData);
    return response.data;
  },

  // 刪除活動
  delete: async (id: string) => {
    await api.delete<void>(`/events/${id}`);
  },

  // 重新送審活動
  resubmit: async (id: string) => {
    const response = await api.patch<CoffeeEvent>(`/events/${id}/resubmit`);
    return response.data;
  },

  // 記錄活動瀏覽量
  recordView: async (id: string): Promise<void> => {
    await api.post(`/events/${id}/view`);
  },

  // 取得熱門活動排行
  getTrending: async (limit = 10): Promise<TrendingEventsResponse> => {
    const response = await api.get<TrendingEventsResponse>('/events/trending', {
      params: { limit },
    });
    return response.data;
  },

  // 管理員專用 API
  admin: {
    // 取得待審核活動 TODO: 換用這隻
    getPending: async () => {
      const response = await api.get<CoffeeEvent[]>('/events/admin/pending');
      return response.data;
    },

    // 快速通過
    approve: async (id: string) => {
      const response = await api.put<CoffeeEvent>(`/events/${id}/approve`);
      return response.data;
    },

    // 快速拒絕 - 更新為支援 reason
    reject: async (id: string, rejectData?: RejectRequest) => {
      const response = await api.put<CoffeeEvent>(`/events/${id}/reject`, rejectData);
      return response.data;
    },

    // 批次審核活動（管理員）
    batchReview: async (
      updates: Array<{
        eventId: string;
        status: 'approved' | 'rejected';
        reason?: string;
      }>
    ) => {
      const response = await api.post<CoffeeEvent[]>('/events/batch-review', {
        updates,
      });
      return response.data;
    },
  },
};
