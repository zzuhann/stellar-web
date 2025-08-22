// 藝人狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Artist } from '@/types';
import { artistsApi, handleApiError, ArtistSearchParams } from '@/lib/api';

interface ArtistState {
  // 狀態
  artists: Artist[];
  loading: boolean;
  error: string | null;

  // 動作
  fetchArtists: (params?: ArtistSearchParams) => Promise<void>;
  createArtist: (
    artist: Omit<
      Artist,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'coffeeEventCount'
    >
  ) => Promise<void>;
  approveArtist: (id: string, groupNames?: string[]) => Promise<void>;
  rejectArtist: (id: string, reason?: string) => Promise<void>;
  markAsExists: (id: string) => Promise<void>;
  deleteArtist: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useArtistStore = create<ArtistState>()(
  devtools(
    (set) => ({
      // 初始狀態
      artists: [],
      loading: false,
      error: null,

      // 取得藝人列表
      fetchArtists: async (params) => {
        set({ loading: true, error: null });
        try {
          const artists = await artistsApi.getAll(params);
          set({ artists, loading: false });
        } catch (error) {
          set({
            error: handleApiError(error),
            loading: false,
          });
        }
      },

      // 新增藝人
      createArtist: async (artistData) => {
        set({ loading: true, error: null });
        try {
          const newArtist = await artistsApi.create(artistData);
          set((state) => ({
            artists: [...state.artists, newArtist],
            loading: false,
          }));
        } catch (error) {
          set({
            error: handleApiError(error),
            loading: false,
          });
          throw error;
        }
      },

      // 審核藝人
      approveArtist: async (id, groupNames) => {
        try {
          await artistsApi.approve(id, groupNames);
          set((state) => ({
            artists: state.artists.map((artist) =>
              artist.id === id ? { ...artist, status: 'approved' as const } : artist
            ),
          }));
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      // 拒絕藝人
      rejectArtist: async (id, reason) => {
        try {
          await artistsApi.reject(id, { reason });
          set((state) => ({
            artists: state.artists.map((artist) =>
              artist.id === id ? { ...artist, status: 'rejected' as const } : artist
            ),
          }));
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      markAsExists: async (id) => {
        try {
          await artistsApi.review(id, { status: 'exists' });
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      // 刪除藝人
      deleteArtist: async (id) => {
        try {
          await artistsApi.delete(id);
          set((state) => ({
            artists: state.artists.filter((artist) => artist.id !== id),
          }));
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      // 清除錯誤
      clearError: () => set({ error: null }),
    }),
    {
      name: 'artist-store',
    }
  )
);
