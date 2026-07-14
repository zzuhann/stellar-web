// 全域 Header 標題狀態管理
// 用於地圖頁等沒有獨立 layout 的頁面，把標題「灌」進掛在 root layout 的全域 Header

import { create } from 'zustand';

interface HeaderTitleState {
  title: string | null;
  setTitle: (title: string | null) => void;
}

export const useHeaderTitleStore = create<HeaderTitleState>()((set) => ({
  title: null,
  setTitle: (title) => set({ title }),
}));
