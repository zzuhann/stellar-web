// Lets a full-screen flow hide the site header and footer (store submission steps, venue-tags §D)

import { create } from 'zustand';

interface SiteChromeState {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

export const useSiteChromeStore = create<SiteChromeState>()((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));
