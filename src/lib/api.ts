/* eslint-disable no-console */
// API 呼叫工具函數

import axios, { AxiosResponse, AxiosError } from 'axios';
import { auth } from './firebase';
import {
  Artist,
  CoffeeEvent,
  ApiResponse,
  EventSearchParams,
  EventsResponse,
  MapDataResponse,
  CreateEventRequest,
  UpdateEventRequest,
} from '@/types';

// 建立 Axios 實例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證 token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器 - 統一錯誤處理
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 過期或無效，可以在這裡處理登出邏輯
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

// 藝人 API 查詢參數
export interface ArtistSearchParams {
  status?: 'approved' | 'pending' | 'rejected';
  createdBy?: string;
  birthdayStartDate?: string; // YYYY-MM-DD
  birthdayEndDate?: string; // YYYY-MM-DD
  search?: string;
  includeStats?: boolean;
  sortBy?: 'stageName' | 'coffeeEventCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// 藝人相關 API
export const artistsApi = {
  // 取得藝人列表（支援新的查詢參數）
  getAll: async (params?: ArtistSearchParams): Promise<Artist[]> => {
    const queryParams: Record<string, string> = {};

    if (params?.status) queryParams.status = params.status;
    if (params?.createdBy) queryParams.createdBy = params.createdBy;
    if (params?.birthdayStartDate) queryParams.birthdayStartDate = params.birthdayStartDate;
    if (params?.birthdayEndDate) queryParams.birthdayEndDate = params.birthdayEndDate;
    if (params?.search) queryParams.search = params.search;
    if (params?.includeStats) queryParams.includeStats = 'true';
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await api.get('/artists', { params: queryParams });
    const rawArtists = response.data || [];

    // 轉換後端格式到前端格式
    return rawArtists.map((artist: Record<string, unknown>) => ({
      id: artist.id,
      stageName: artist.stageName,
      realName: artist.realName,
      birthday: artist.birthday,
      profileImage: artist.profileImage,
      status: artist.status,
      createdBy: artist.createdBy,
      createdAt: (artist.createdAt as { _seconds?: number })?._seconds
        ? new Date((artist.createdAt as { _seconds: number })._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: (artist.updatedAt as { _seconds?: number })?._seconds
        ? new Date((artist.updatedAt as { _seconds: number })._seconds * 1000).toISOString()
        : new Date().toISOString(),
      coffeeEventCount: artist.coffeeEventCount, // 新增統計欄位
    }));
  },

  // 新增藝人
  create: async (
    artist: Omit<
      Artist,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'coffeeEventCount'
    >
  ): Promise<Artist> => {
    const response = await api.post<ApiResponse<Artist>>('/artists', artist);
    return response.data.data!;
  },

  // 審核藝人（管理員）
  approve: async (id: string): Promise<void> => {
    await api.put(`/artists/${id}/approve`);
  },

  // 拒絕藝人（管理員）
  reject: async (id: string): Promise<void> => {
    await api.put(`/artists/${id}/reject`);
  },

  // 獲取單一藝人詳細資料
  getById: async (id: string): Promise<Artist> => {
    const response = await api.get(`/artists/${id}`);
    const artist = response.data;

    // 轉換後端格式到前端格式
    return {
      id: artist.id,
      stageName: artist.stageName,
      realName: artist.realName,
      birthday: artist.birthday,
      profileImage: artist.profileImage,
      status: artist.status,
      createdBy: artist.createdBy,
      createdAt: artist.createdAt?._seconds
        ? new Date(artist.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: artist.updatedAt?._seconds
        ? new Date(artist.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      coffeeEventCount: artist.coffeeEventCount,
    };
  },

  // 軟刪除藝人（管理員）
  delete: async (id: string): Promise<void> => {
    await api.delete(`/artists/${id}`);
  },
};

// 用戶投稿資料格式
export interface UserSubmissionsResponse {
  artists: Artist[];
  events: CoffeeEvent[];
  summary: {
    totalArtists: number;
    totalEvents: number;
    pendingArtists: number;
    pendingEvents: number;
    approvedArtists: number;
    approvedEvents: number;
  };
}

// 活動相關 API
export const eventsApi = {
  // 獲取活動列表（支援新的查詢參數）
  getAll: async (params?: EventSearchParams): Promise<EventsResponse> => {
    const queryParams: Record<string, string> = {};

    if (params?.search) queryParams.search = params.search;
    if (params?.artistId) queryParams.artistId = params.artistId;
    if (params?.status) queryParams.status = params.status;
    if (params?.region) queryParams.region = params.region;
    if (params?.createdBy) queryParams.createdBy = params.createdBy;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();

    const response = await api.get('/events', { params: queryParams });
    return response.data as EventsResponse;
  },

  // 獲取地圖資料
  getMapData: async (params?: {
    status?: 'active' | 'upcoming' | 'all';
    bounds?: string;
    center?: string; // 新增：地圖中心點 "lat,lng"
    zoom?: number;
    search?: string;
    artistId?: string;
    region?: string;
  }): Promise<MapDataResponse> => {
    const queryParams: Record<string, string> = {};

    if (params?.status) queryParams.status = params.status;
    if (params?.bounds) queryParams.bounds = params.bounds;
    if (params?.center) queryParams.center = params.center; // 新增 center 參數
    if (params?.zoom) queryParams.zoom = params.zoom.toString();
    if (params?.search) queryParams.search = params.search;
    if (params?.artistId) queryParams.artistId = params.artistId;
    if (params?.region) queryParams.region = params.region;

    const response = await api.get('/events/map-data', { params: queryParams });
    return response.data as MapDataResponse;
  },

  // 搜尋活動
  search: async (params: {
    query?: string;
    artistName?: string;
    location?: string;
  }): Promise<CoffeeEvent[]> => {
    const response = await api.get('/events/search', { params });
    return response.data as CoffeeEvent[];
  },

  // 獲取單一活動詳情
  getById: async (id: string): Promise<CoffeeEvent | null> => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data as CoffeeEvent;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // 獲取用戶投稿
  getMySubmissions: async (): Promise<UserSubmissionsResponse> => {
    const response = await api.get('/events/me');
    return response.data as UserSubmissionsResponse;
  },

  // 建立活動
  create: async (eventData: CreateEventRequest): Promise<CoffeeEvent> => {
    const response = await api.post('/events', eventData);
    return response.data as CoffeeEvent;
  },

  // 編輯活動
  update: async (id: string, updateData: UpdateEventRequest): Promise<CoffeeEvent> => {
    const response = await api.put(`/events/${id}`, updateData);
    return response.data as CoffeeEvent;
  },

  // 刪除活動
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // 管理員專用 API
  admin: {
    // 獲取待審核活動
    getPending: async (): Promise<CoffeeEvent[]> => {
      const response = await api.get('/events/admin/pending');
      return response.data as CoffeeEvent[];
    },

    // 審核活動
    review: async (id: string, status: 'approved' | 'rejected'): Promise<CoffeeEvent> => {
      const response = await api.patch(`/events/${id}/review`, { status });
      return response.data as CoffeeEvent;
    },

    // 快速通過
    approve: async (id: string): Promise<CoffeeEvent> => {
      const response = await api.put(`/events/${id}/approve`);
      return response.data as CoffeeEvent;
    },

    // 快速拒絕
    reject: async (id: string): Promise<CoffeeEvent> => {
      const response = await api.put(`/events/${id}/reject`);
      return response.data as CoffeeEvent;
    },
  },
};

// 統一錯誤處理函數
export function handleApiError(error: unknown): string {
  console.error('API Error:', error);

  if (axios.isAxiosError(error)) {
    // 記錄詳細錯誤資訊
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Request config:', error.config);

    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.status === 401) {
      return '請先登入後再試';
    }
    if (error.response?.status === 403) {
      return '權限不足';
    }
    if (error.response?.status === 400) {
      return '請求格式錯誤';
    }
    if (error.message) {
      return error.message;
    }
  }
  return '發生未知錯誤';
}

// 檢查網路連線
export async function checkApiConnection(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

export default api;
