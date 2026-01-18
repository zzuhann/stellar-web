import axios, { AxiosError } from 'axios';
import { auth } from './firebase';
import {
  Artist,
  CoffeeEvent,
  User,
  EventSearchParams,
  EventsResponse,
  MapDataResponse,
  CreateEventRequest,
  UpdateEventRequest,
  UpdateArtistRequest,
  ArtistReviewRequest,
  RejectRequest,
  UpdateUserRequest,
  FavoriteFilterParams,
  FavoritesResponse,
  UserFavorite,
  FavoriteCheckResponse,
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
    } catch {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器 - 統一錯誤處理
api.interceptors.response.use(
  (response) => response, // 不標註型別，保留泛型推斷
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 過期或無效，可以在這裡處理登出邏輯
    }
    return Promise.reject(error);
  }
);

// 藝人 API 查詢參數
export interface ArtistSearchParams {
  status?: 'approved' | 'pending' | 'rejected' | 'exists';
  createdBy?: string;
  birthdayStartDate?: string; // YYYY-MM-DD
  birthdayEndDate?: string; // YYYY-MM-DD
  search?: string;
  sortBy?: 'stageName' | 'coffeeEventCount' | 'createdAt' | 'birthday';
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
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await api.get('/artists', { params: queryParams });
    const rawArtists = response.data || [];

    // 轉換後端格式到前端格式
    return rawArtists.map((artist: Record<string, unknown>) => ({
      id: artist.id,
      stageName: artist.stageName,
      stageNameZh: artist.stageNameZh, // 新增中文藝名
      groupNames: artist.groupNames, // 新增團名陣列
      realName: artist.realName,
      birthday: artist.birthday,
      profileImage: artist.profileImage,
      status: artist.status,
      rejectedReason: artist.rejectedReason, // 新增拒絕原因
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
  ) => {
    const response = await api.post<Artist>('/artists', artist);
    return response.data;
  },

  // 編輯藝人
  update: async (id: string, updateData: UpdateArtistRequest) => {
    const response = await api.put<Artist>(`/artists/${id}`, updateData);
    return response.data;
  },

  // 重新送審藝人
  resubmit: async (id: string) => {
    const response = await api.patch<Artist>(`/artists/${id}/resubmit`);
    return response.data;
  },

  // 審核藝人（管理員）- 更新為支援 reason
  review: async (id: string, reviewData: ArtistReviewRequest) => {
    const response = await api.patch<Artist>(`/artists/${id}/review`, reviewData);
    return response.data;
  },

  // 審核藝人（管理員）- 支援設定團名
  approve: async (id: string, groupNames?: string[]) => {
    const body = groupNames && groupNames.length > 0 ? { adminUpdate: { groupNames } } : {};
    await api.put<void>(`/artists/${id}/approve`, body);
  },

  // 拒絕藝人（管理員）- 更新為支援 reason
  reject: async (id: string, rejectData?: RejectRequest) => {
    await api.put<void>(`/artists/${id}/reject`, rejectData);
  },

  // 取得單一藝人詳細資料
  getById: async (id: string) => {
    const response = await api.get<Artist>(`/artists/${id}`);
    const artist = response.data;

    // 轉換後端格式到前端格式
    return {
      id: artist.id,
      stageName: artist.stageName,
      stageNameZh: artist.stageNameZh, // 新增中文藝名
      groupNames: artist.groupNames, // 新增團名陣列
      realName: artist.realName,
      birthday: artist.birthday,
      profileImage: artist.profileImage,
      status: artist.status,
      rejectedReason: artist.rejectedReason, // 新增拒絕原因
      createdBy: artist.createdBy,
      createdAt:
        typeof artist.createdAt === 'object' &&
        ' _seconds' in artist.createdAt &&
        artist.createdAt?._seconds
          ? new Date(artist.createdAt._seconds * 1000).toISOString()
          : new Date().toISOString(),
      updatedAt:
        typeof artist.updatedAt === 'object' &&
        ' _seconds' in artist.updatedAt &&
        artist.updatedAt?._seconds
          ? new Date(artist.updatedAt._seconds * 1000).toISOString()
          : new Date().toISOString(),
      coffeeEventCount: artist.coffeeEventCount,
    };
  },

  // 軟刪除藝人（管理員）
  delete: async (id: string) => {
    await api.delete<void>(`/artists/${id}`);
  },

  // 批次審核藝人（管理員）
  batchReview: async (
    updates: Array<{
      artistId: string;
      status: 'approved' | 'rejected' | 'exists';
      groupNames?: string[];
      reason?: string;
    }>
  ) => {
    const response = await api.post<Artist[]>('/artists/batch-review', {
      updates,
    });
    return response.data;
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

  // 取得用戶投稿
  getMySubmissions: async () => {
    const response = await api.get<UserSubmissionsResponse>('/events/me');
    return response.data;
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
  },
};

// 用戶相關 API
export const usersApi = {
  // 更新用戶資料
  updateProfile: async (updateData: UpdateUserRequest) => {
    const response = await api.put<User>('/users/profile', updateData);
    return response.data;
  },

  // 收藏相關
  favorites: {
    // 取得收藏列表
    getAll: async (params?: FavoriteFilterParams) => {
      const searchParams = new URLSearchParams();

      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.artistIds?.length) searchParams.set('artistIds', params.artistIds.join(','));
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));

      const queryString = searchParams.toString();
      const response = await api.get<FavoritesResponse>(
        `/users/favorites${queryString ? `?${queryString}` : ''}`
      );
      return response.data;
    },

    // 新增收藏
    add: async (eventId: string) => {
      const response = await api.post<UserFavorite>('/users/favorites', { eventId });
      return response.data;
    },

    // 取消收藏
    remove: async (eventId: string) => {
      await api.delete<void>(`/users/favorites/${eventId}`);
    },

    // 檢查是否已收藏
    check: async (eventId: string) => {
      const response = await api.get<FavoriteCheckResponse>(`/users/favorites/${eventId}/check`);
      return response.data;
    },
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
    if (error.response?.status === 401) {
      return '請先登入後再試';
    }
    if (error.response?.status === 403) {
      return '權限不足';
    }
    if (error.response?.status === 400) {
      return '格式錯誤';
    }
    if (error.message) {
      return error.message;
    }
  }
  return '發生未知錯誤';
}

export default api;
