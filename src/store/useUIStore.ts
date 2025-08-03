// UI 狀態管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // 狀態
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;
  modalData: unknown;
  loading: boolean;
  notifications: Notification[];

  // 動作
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // 初始狀態
      sidebarOpen: false,
      mobileMenuOpen: false,
      searchOpen: false,
      modalOpen: false,
      modalType: null,
      modalData: null,
      loading: false,
      notifications: [],

      // 切換側邊欄
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      // 設定側邊欄狀態
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      // 切換行動選單
      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },

      // 設定行動選單狀態
      setMobileMenuOpen: (open) => {
        set({ mobileMenuOpen: open });
      },

      // 切換搜尋
      toggleSearch: () => {
        set((state) => ({ searchOpen: !state.searchOpen }));
      },

      // 設定搜尋狀態
      setSearchOpen: (open) => {
        set({ searchOpen: open });
      },

      // 開啟模態視窗
      openModal: (type, data = null) => {
        set({
          modalOpen: true,
          modalType: type,
          modalData: data,
        });
      },

      // 關閉模態視窗
      closeModal: () => {
        set({
          modalOpen: false,
          modalType: null,
          modalData: null,
        });
      },

      // 設定載入狀態
      setLoading: (loading) => {
        set({ loading });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);
