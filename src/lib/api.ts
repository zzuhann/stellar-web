// API 呼叫工具函數

import axios, { AxiosResponse, AxiosError } from 'axios';
import { auth } from './firebase';
import { Artist, CoffeeEvent, ApiResponse, EventSearchParams } from '@/types';

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

// 藝人相關 API
export const artistsApi = {
  // 取得所有已審核藝人
  getAll: async (): Promise<Artist[]> => {
    const response = await api.get<ApiResponse<Artist[]>>('/artists');
    return response.data.data || [];
  },

  // 新增藝人
  create: async (artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>): Promise<Artist> => {
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

  // 軟刪除藝人（管理員）
  delete: async (id: string): Promise<void> => {
    await api.delete(`/artists/${id}`);
  },
};

// 活動相關 API
export const eventsApi = {
  // 取得所有已審核活動
  getAll: async (): Promise<CoffeeEvent[]> => {
    const response = await api.get<ApiResponse<CoffeeEvent[]>>('/events');
    return response.data.data || [];
  },

  // 取得單一活動詳情
  getById: async (id: string): Promise<CoffeeEvent | null> => {
    try {
      const response = await api.get<ApiResponse<CoffeeEvent>>(`/events/${id}`);
      return response.data.data || null;
    } catch (error) {
      return null;
    }
  },

  // 搜尋活動
  search: async (params: EventSearchParams): Promise<CoffeeEvent[]> => {
    const response = await api.get<ApiResponse<CoffeeEvent[]>>('/events/search', {
      params,
    });
    return response.data.data || [];
  },

  // 新增活動
  create: async (event: Omit<CoffeeEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>): Promise<CoffeeEvent> => {
    const response = await api.post<ApiResponse<CoffeeEvent>>('/events', event);
    return response.data.data!;
  },

  // 審核活動（管理員）
  approve: async (id: string): Promise<void> => {
    await api.put(`/events/${id}/approve`);
  },

  // 拒絕活動（管理員）
  reject: async (id: string): Promise<void> => {
    await api.put(`/events/${id}/reject`);
  },

  // 軟刪除活動（管理員）
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// 統一錯誤處理函數
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
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
  } catch (error) {
    return false;
  }
}

export default api;