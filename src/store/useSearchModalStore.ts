// Global artist search modal state, shared by the header icon, TopArtistsSection pill, and SearchSection entry points via the single layout-level ArtistSearchModal instance (see GlobalSearchModal).
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
    // isOpen is a boolean, not a toggle: triggering again while already open (same or another button) is a no-op.
    if (get().isOpen) return;
    set({ isOpen: true, entryPoint, triggerRef });
  },
  // Keep entryPoint/triggerRef on close — still needed to return focus to the trigger button.
  close: () => set({ isOpen: false }),
}));
