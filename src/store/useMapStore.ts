// 地圖狀態管理

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { MapCenter, EventMarker } from '@/types';
import { TAIWAN_MAP_CENTER, STORAGE_KEYS } from '@/constants';

interface MapState {
  // 狀態
  center: MapCenter;
  markers: EventMarker[];
  selectedMarkerId: string | null;
  zoom: number;

  // 動作
  setCenter: (center: Partial<MapCenter>) => void;
  setMarkers: (markers: EventMarker[]) => void;
  selectMarker: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  resetMap: () => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    persist(
      (set) => ({
        // 初始狀態
        center: TAIWAN_MAP_CENTER,
        markers: [],
        selectedMarkerId: null,
        zoom: TAIWAN_MAP_CENTER.zoom,

        // 設定地圖中心
        setCenter: (centerUpdate) => {
          set((state) => ({
            center: { ...state.center, ...centerUpdate },
          }));
        },

        // 設定標記
        setMarkers: (markers) => {
          set({ markers });
        },

        // 選擇標記
        selectMarker: (id) => {
          set({ selectedMarkerId: id });
        },

        // 設定縮放級別
        setZoom: (zoom) => {
          set((state) => ({
            zoom,
            center: { ...state.center, zoom },
          }));
        },

        // 重設地圖
        resetMap: () => {
          set({
            center: TAIWAN_MAP_CENTER,
            zoom: TAIWAN_MAP_CENTER.zoom,
            selectedMarkerId: null,
          });
        },
      }),
      {
        name: STORAGE_KEYS.MAP_CENTER,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          center: state.center,
          zoom: state.zoom,
        }),
      }
    ),
    {
      name: 'map-store',
    }
  )
);
