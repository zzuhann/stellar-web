// 活動狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CoffeeEvent, EventSearchParams } from '@/types';
import { eventsApi, artistsApi, handleApiError } from '@/lib/api';

interface EventState {
  // 狀態
  events: CoffeeEvent[];
  currentEvent: CoffeeEvent | null;
  loading: boolean;
  error: string | null;
  searchParams: EventSearchParams;

  // 動作
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  searchEvents: (params: EventSearchParams) => Promise<void>;
  createEvent: (event: Omit<CoffeeEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>) => Promise<void>;
  approveEvent: (id: string) => Promise<void>;
  rejectEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSearchParams: (params: Partial<EventSearchParams>) => void;
  clearError: () => void;
  clearCurrentEvent: () => void;
}

export const useEventStore = create<EventState>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      events: [],
      currentEvent: null,
      loading: false,
      error: null,
      searchParams: {},

      // 取得所有活動
      fetchEvents: async () => {
        set({ loading: true, error: null });
        try {
          const [events, artists] = await Promise.all([
            eventsApi.getAll(),
            artistsApi.getAll()
          ]);
          
          // 只顯示已審核的活動，並補充 artistName
          const approvedEvents = events.filter(event => event.status === 'approved');
          const eventsWithArtistNames = approvedEvents.map(event => {
            const artist = artists.find(a => a.id === event.artistId);
            return {
              ...event,
              artistName: artist?.stageName || event.artistName || 'Unknown Artist'
            };
          });
          
          set({ events: eventsWithArtistNames, loading: false });
        } catch (error) {
          set({ 
            error: handleApiError(error), 
            loading: false 
          });
        }
      },

      // 取得單一活動
      fetchEventById: async (id) => {
        set({ loading: true, error: null });
        try {
          const event = await eventsApi.getById(id);
          set({ currentEvent: event, loading: false });
        } catch (error) {
          set({ 
            error: handleApiError(error), 
            loading: false 
          });
        }
      },

      // 搜尋活動
      searchEvents: async (params) => {
        set({ loading: true, error: null, searchParams: params });
        try {
          const events = await eventsApi.search(params);
          set({ events, loading: false });
        } catch (error) {
          set({ 
            error: handleApiError(error), 
            loading: false 
          });
        }
      },

      // 新增活動
      createEvent: async (eventData) => {
        set({ loading: true, error: null });
        try {
          const newEvent = await eventsApi.create(eventData);
          // 新活動狀態為 pending，不加入到顯示列表中
          // 只有 approved 狀態的活動才會在地圖上顯示
          set({ loading: false });
        } catch (error) {
          set({ 
            error: handleApiError(error), 
            loading: false 
          });
          throw error;
        }
      },

      // 審核活動
      approveEvent: async (id) => {
        try {
          await eventsApi.approve(id);
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id 
                ? { ...event, status: 'approved' as const }
                : event
            ),
            currentEvent: state.currentEvent?.id === id
              ? { ...state.currentEvent, status: 'approved' as const }
              : state.currentEvent,
          }));
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      // 拒絕活動
      rejectEvent: async (id) => {
        try {
          await eventsApi.reject(id);
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id 
                ? { ...event, status: 'rejected' as const }
                : event
            ),
            currentEvent: state.currentEvent?.id === id
              ? { ...state.currentEvent, status: 'rejected' as const }
              : state.currentEvent,
          }));
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      // 刪除活動
      deleteEvent: async (id) => {
        try {
          await eventsApi.delete(id);
          set((state) => ({
            events: state.events.filter((event) => event.id !== id),
            currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
          }));
        } catch (error) {
          set({ error: handleApiError(error) });
          throw error;
        }
      },

      // 設定搜尋參數
      setSearchParams: (params) => {
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        }));
      },

      // 清除錯誤
      clearError: () => set({ error: null }),

      // 清除當前活動
      clearCurrentEvent: () => set({ currentEvent: null }),
    }),
    {
      name: 'event-store',
    }
  )
);