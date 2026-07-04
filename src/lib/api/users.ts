import {
  User,
  UpdateUserRequest,
  FavoriteFilterParams,
  FavoritesResponse,
  UserFavorite,
  FavoriteCheckResponse,
  UserSubmissionsArtistsResponse,
  UserSubmissionsEventsResponse,
} from '@/types';
import api from './client';

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

  submissions: {
    getEvents: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page != null) searchParams.set('page', String(params.page));
      if (params?.limit != null) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      const response = await api.get<UserSubmissionsEventsResponse>(
        `/users/me/submissions/events${qs ? `?${qs}` : ''}`
      );
      return response.data;
    },
    getArtists: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page != null) searchParams.set('page', String(params.page));
      if (params?.limit != null) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      const response = await api.get<UserSubmissionsArtistsResponse>(
        `/users/me/submissions/artists${qs ? `?${qs}` : ''}`
      );
      return response.data;
    },
  },
};
