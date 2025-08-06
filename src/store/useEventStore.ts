// 活動狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  CoffeeEvent,
  EventSearchParams,
  EventsResponse,
  CreateEventRequest,
  UpdateEventRequest,
} from '@/types';
import { eventsApi, handleApiError } from '@/lib/api';

interface EventState {
  // 狀態
  events: CoffeeEvent[];
  currentEvent: CoffeeEvent | null;
  loading: boolean;
  error: string | null;
  searchParams: EventSearchParams;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // 動作
  fetchEvents: (params?: EventSearchParams) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  searchEvents: (params: {
    query?: string;
    artistName?: string;
    location?: string;
  }) => Promise<void>;
  createEvent: (eventData: CreateEventRequest) => Promise<void>;
  updateEvent: (id: string, updateData: UpdateEventRequest) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSearchParams: (params: Partial<EventSearchParams>) => void;
  clearError: () => void;
  clearCurrentEvent: () => void;

  // 管理員功能
  admin: {
    fetchPendingEvents: () => Promise<void>;
    approveEvent: (id: string) => Promise<void>;
    rejectEvent: (id: string, reason?: string) => Promise<void>;
    reviewEvent: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  };
}

export const useEventStore = create<EventState>()(
  devtools(
    (set) => ({
      // 初始狀態
      events: [],
      currentEvent: null,
      loading: false,
      error: null,
      searchParams: {},
      pagination: null,

      // 取得活動列表
      fetchEvents: async (params) => {
        set({ loading: true, error: null });
        try {
          const response: EventsResponse = await eventsApi.getAll(params);
          set({
            events: response.events,
            pagination: response.pagination,
            searchParams: params || {},
            loading: false,
          });
        } catch (error) {
          set({
            error: handleApiError(error),
            loading: false,
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
            loading: false,
          });
        }
      },

      // 搜尋活動
      searchEvents: async (params) => {
        set({ loading: true, error: null });
        try {
          const events = await eventsApi.search(params);
          set({ events, loading: false });
        } catch (error) {
          set({
            error: handleApiError(error),
            loading: false,
          });
        }
      },

      // 新增活動
      createEvent: async (eventData) => {
        set({ loading: true, error: null });
        try {
          const newEvent = await eventsApi.create(eventData);
          // 新活動狀態為 pending，加入到列表中但可能不會顯示在地圖上
          set((state) => ({
            events: [newEvent, ...state.events],
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

      // 更新活動
      updateEvent: async (id, updateData) => {
        set({ loading: true, error: null });
        try {
          const updatedEvent = await eventsApi.update(id, updateData);
          set((state) => ({
            events: state.events.map((event) => (event.id === id ? updatedEvent : event)),
            currentEvent: state.currentEvent?.id === id ? updatedEvent : state.currentEvent,
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

      // 管理員功能
      admin: {
        // 獲取待審核活動
        fetchPendingEvents: async () => {
          set({ loading: true, error: null });
          try {
            const events = await eventsApi.admin.getPending();
            set({ events, loading: false });
          } catch (error) {
            set({
              error: handleApiError(error),
              loading: false,
            });
          }
        },

        // 審核活動
        reviewEvent: async (id, status) => {
          try {
            const updatedEvent = await eventsApi.admin.review(id, status);
            set((state) => ({
              events: state.events.map((event) => (event.id === id ? updatedEvent : event)),
              currentEvent: state.currentEvent?.id === id ? updatedEvent : state.currentEvent,
            }));
          } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
          }
        },

        // 快速通過
        approveEvent: async (id) => {
          try {
            const updatedEvent = await eventsApi.admin.approve(id);
            set((state) => ({
              events: state.events.map((event) => (event.id === id ? updatedEvent : event)),
              currentEvent: state.currentEvent?.id === id ? updatedEvent : state.currentEvent,
            }));
          } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
          }
        },

        // 快速拒絕
        rejectEvent: async (id, reason) => {
          try {
            const updatedEvent = await eventsApi.admin.reject(id, reason);
            set((state) => ({
              events: state.events.map((event) => (event.id === id ? updatedEvent : event)),
              currentEvent: state.currentEvent?.id === id ? updatedEvent : state.currentEvent,
            }));
          } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
          }
        },
      },
    }),
    {
      name: 'event-store',
    }
  )
);
