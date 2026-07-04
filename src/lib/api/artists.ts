import { Artist, UpdateArtistRequest, ArtistReviewRequest, RejectRequest } from '@/types';
import api from './client';

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

// Top Artist 回傳型別
export interface TopArtist extends Artist {
  upcomingEventCount: number;
}

// 藝人相關 API
export const artistsApi = {
  // 取得擁有最多生咖的藝人
  getTop: async (limit = 10): Promise<TopArtist[]> => {
    const response = await api.get<TopArtist[]>('/artists/top', {
      params: { limit: Math.min(limit, 50) },
    });
    return response.data;
  },

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
      slug: artist.slug,
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
    > & { submitterEmail?: string }
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
      slug: artist.slug,
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
        '_seconds' in artist.createdAt &&
        artist.createdAt?._seconds
          ? new Date(artist.createdAt._seconds * 1000).toISOString()
          : new Date().toISOString(),
      updatedAt:
        typeof artist.updatedAt === 'object' &&
        '_seconds' in artist.updatedAt &&
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
