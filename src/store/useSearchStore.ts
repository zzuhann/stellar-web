// 搜尋專用狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Artist } from '@/types';
import { artistsApi, handleApiError } from '@/lib/api';

interface SearchState {
  // 狀態
  searchResults: Artist[];
  searchLoading: boolean;
  searchError: string | null;
  searchQuery: string;
  searchCache: Map<string, Artist[]>;

  // 動作
  searchArtists: (query: string) => Promise<void>;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchQuery: '',
      searchCache: new Map(),

      // 搜尋藝人
      searchArtists: async (query: string) => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
          set({ searchResults: [], searchLoading: false });
          return;
        }

        // 檢查快取
        const cache = get().searchCache;
        if (cache.has(trimmedQuery)) {
          set({
            searchResults: cache.get(trimmedQuery) || [],
            searchLoading: false,
            searchError: null,
          });
          return;
        }

        set({ searchLoading: true, searchError: null });

        try {
          const results = await artistsApi.getAll({
            status: 'approved',
            search: trimmedQuery,
            includeStats: true,
            sortBy: 'coffeeEventCount',
            sortOrder: 'desc',
          });

          // 更新快取
          const newCache = new Map(cache);
          newCache.set(trimmedQuery, results);

          // 限制快取大小 (最多 50 個查詢)
          if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            if (firstKey) {
              newCache.delete(firstKey);
            }
          }

          set({
            searchResults: results,
            searchLoading: false,
            searchCache: newCache,
          });
        } catch (error) {
          set({
            searchError: handleApiError(error),
            searchLoading: false,
          });
        }
      },

      // 設定搜尋關鍵字
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // 清除搜尋
      clearSearch: () => {
        set({
          searchResults: [],
          searchQuery: '',
          searchLoading: false,
          searchError: null,
        });
      },

      // 清除錯誤
      clearError: () => set({ searchError: null }),
    }),
    {
      name: 'search-store',
    }
  )
);
