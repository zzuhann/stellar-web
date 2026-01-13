// 藝人狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Artist } from '@/types';
import { artistsApi, handleApiError } from '@/lib/api';

interface ArtistState {
  // 狀態 - 移除 artists 和 loading，因為這些現在由 React Query 管理
  error: string | null;

  // 動作
  createArtist: (
    artist: Omit<
      Artist,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'coffeeEventCount'
    >
  ) => Promise<void>;
}

export const useArtistStore = create<ArtistState>()(
  devtools(
    (set) => ({
      // 初始狀態
      error: null,

      // 新增藝人
      createArtist: async (artistData) => {
        set({ error: null });
        try {
          const newArtist = await artistsApi.create(artistData);
          // React Query 會處理快取更新，無需手動更新本地狀態
          return newArtist;
        } catch (error) {
          set({
            error: handleApiError(error),
          });
          throw error;
        }
      },
    }),
    {
      name: 'artist-store',
    }
  )
);
