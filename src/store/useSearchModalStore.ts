// 全域藝人搜尋 modal 狀態：讓 header icon／TopArtistsSection pill／SearchSection
// 三個入口共用同一個掛在 layout 層級的 ArtistSearchModal 實例（見 GlobalSearchModal）。
import { create } from 'zustand';
import { RefObject } from 'react';

export type SearchModalEntryPoint = 'header' | 'top_artists' | 'search_section';

interface SearchModalState {
  isOpen: boolean;
  entryPoint: SearchModalEntryPoint | null;
  triggerRef: RefObject<HTMLElement | null> | null;
  open: (entryPoint: SearchModalEntryPoint, triggerRef: RefObject<HTMLElement | null>) => void;
  close: () => void;
}

export const useSearchModalStore = create<SearchModalState>()((set, get) => ({
  isOpen: false,
  entryPoint: null,
  triggerRef: null,
  open: (entryPoint, triggerRef) => {
    // isOpen 是布林值不是 toggle：已開啟時再次觸發（同一顆或誤觸另一顆）視為 no-op
    if (get().isOpen) return;
    set({ isOpen: true, entryPoint, triggerRef });
  },
  // 保留 entryPoint/triggerRef：關閉當下仍需要它們把焦點還給觸發按鈕
  close: () => set({ isOpen: false }),
}));
