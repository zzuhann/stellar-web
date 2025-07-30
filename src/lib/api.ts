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
  // 取得藝人列表（可指定狀態）
  getAll: async (status?: 'approved' | 'pending' | 'rejected'): Promise<Artist[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/artists', { params });
    const rawArtists = response.data || [];
    
    // 轉換後端格式到前端格式
    return rawArtists.map((artist: any) => ({
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
    }));
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
  // 取得活動列表（可指定狀態）
  getAll: async (status?: 'approved' | 'pending' | 'rejected'): Promise<CoffeeEvent[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/events', { params });
    const rawEvents = response.data || [];
    
    // 轉換後端格式到前端格式
    return rawEvents.map((event: any) => ({
      id: event.id,
      title: event.title,
      artistId: event.artistId,
      artistName: event.artistName || '', // 需要從 artistId 查詢
      description: event.description || '',
      startDate: event.datetime?.start 
        ? new Date(event.datetime.start._seconds * 1000).toISOString()
        : new Date().toISOString(),
      endDate: event.datetime?.end
        ? new Date(event.datetime.end._seconds * 1000).toISOString()
        : new Date().toISOString(),
      location: {
        address: event.location?.address || '',
        coordinates: {
          lat: event.location?.coordinates?.lat || 0,
          lng: event.location?.coordinates?.lng || 0,
        },
      },
      contactInfo: {
        phone: event.contactInfo?.phone,
        instagram: event.socialMedia?.instagram,
        facebook: event.socialMedia?.facebook || event.socialMedia?.twitter,
      },
      images: event.images || [],
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt?._seconds 
        ? new Date(event.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: event.updatedAt?._seconds
        ? new Date(event.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }));
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
    // 取得當前用戶 ID
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('請先登入後再投稿活動');
    }

    // 轉換前端格式到後端格式 - 符合 Firestore 結構
    const backendEvent = {
      title: event.title,
      artistId: event.artistId,
      description: event.description,
      datetime: {
        start: new Date(event.startDate),
        end: new Date(event.endDate),
      },
      location: {
        address: event.location.address,
        coordinates: {
          lat: event.location.coordinates.lat,
          lng: event.location.coordinates.lng,
        },
      },
      socialMedia: {
        instagram: event.contactInfo?.instagram || '',
        twitter: event.contactInfo?.facebook || '',
      },
      images: event.images && event.images.length > 0 ? event.images : [''],
      status: 'pending',
      isDeleted: false,
      createdBy: currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Sending event data to backend:', JSON.stringify(backendEvent, null, 2));
    
    let response;
    try {
      response = await api.post('/events', backendEvent);
      console.log('Backend response:', response.data);
    } catch (error) {
      console.error('=== Event Creation Error Details ===');
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Headers:', error.response?.headers);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Request URL:', error.config?.url);
        console.error('Request Method:', error.config?.method);
        console.error('Request Headers:', error.config?.headers);
        console.error('Request Data:', error.config?.data);
      } else {
        console.error('Non-Axios Error:', error);
      }
      throw error;
    }
    
    // 轉換回前端格式
    const rawEvent = response.data;
    return {
      id: rawEvent.id,
      title: rawEvent.title,
      artistId: rawEvent.artistId,
      artistName: event.artistName, // 保留原本的 artistName
      description: rawEvent.description || '',
      startDate: rawEvent.datetime?.start 
        ? new Date(rawEvent.datetime.start._seconds * 1000).toISOString()
        : event.startDate,
      endDate: rawEvent.datetime?.end
        ? new Date(rawEvent.datetime.end._seconds * 1000).toISOString()
        : event.endDate,
      location: event.location,
      contactInfo: event.contactInfo,
      images: rawEvent.images || [],
      status: rawEvent.status || 'pending',
      createdBy: rawEvent.createdBy || '',
      createdAt: rawEvent.createdAt?._seconds 
        ? new Date(rawEvent.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: rawEvent.updatedAt?._seconds
        ? new Date(rawEvent.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    };
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
  } catch (error) {
    return false;
  }
}

export default api;