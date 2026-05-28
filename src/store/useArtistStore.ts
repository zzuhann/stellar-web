// 藝人狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Artist } from '@/types';
import { artistsApi, handleApiError } from '@/lib/api';

interface ArtistState {
  error: string | null;

  createArtist: (
    artist: Omit<
      Artist,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'coffeeEventCount'
    > & { submitterEmail?: string }
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
          await artistsApi.create(artistData);
          // React Query 會處理快取更新，無需手動更新本地狀態
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
