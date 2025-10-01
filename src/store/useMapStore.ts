// 地圖狀態管理

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { MapCenter, EventMarker, MapEvent } from '@/types';
import { TAIWAN_MAP_CENTER, STORAGE_KEYS } from '@/constants';

interface MapState {
  // 狀態
  center: MapCenter;
  markers: EventMarker[];
  selectedMarkerId: string | null;
  selectedEventId: string | null;
  isDrawerExpanded: boolean;
  expandedHeight: number;
  selectedLocationEvents: MapEvent[];
  isLocationSelected: boolean;

  // 動作
  setCenter: (center: Partial<MapCenter>) => void;
  setMarkers: (markers: EventMarker[]) => void;
  selectMarker: (id: string | null) => void;
  resetMap: () => void;
  setSelectedEventId: (id: string | null) => void;
  setIsDrawerExpanded: (isExpanded: boolean) => void;
  setExpandedHeight: (height: number) => void;
  setSelectedLocationEvents: (events: MapEvent[]) => void;
  setIsLocationSelected: (isSelected: boolean) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    persist(
      (set) => ({
        // 初始狀態
        center: TAIWAN_MAP_CENTER,
        markers: [],
        selectedMarkerId: null,
        selectedEventId: null,
        isDrawerExpanded: false,
        expandedHeight: 500,
        selectedLocationEvents: [],
        isLocationSelected: false,
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

        // 重設地圖
        resetMap: () => {
          set((state) => ({
            center: TAIWAN_MAP_CENTER,
            selectedMarkerId: null,
            selectedEventId: null,
            isDrawerExpanded: false,
            expandedHeight: state.expandedHeight, // 保留當前的展開高度
            selectedLocationEvents: [],
            isLocationSelected: false,
          }));
        },

        // 設定選中的活動
        setSelectedEventId: (id) => {
          set({ selectedEventId: id });
        },

        // 設定 drawer 是否展開
        setIsDrawerExpanded: (isExpanded) => {
          set({ isDrawerExpanded: isExpanded });
        },

        // 設定 drawer 展開高度
        setExpandedHeight: (height) => {
          set({ expandedHeight: height });
        },

        // 設定選中的地點活動
        setSelectedLocationEvents: (events) => {
          set({ selectedLocationEvents: events });
        },

        // 設定是否選中地點
        setIsLocationSelected: (isSelected) => {
          set({ isLocationSelected: isSelected });
        },
      }),
      {
        name: STORAGE_KEYS.MAP_CENTER,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          center: state.center,
          selectedEventId: state.selectedEventId,
          isDrawerExpanded: state.isDrawerExpanded,
          expandedHeight: state.expandedHeight,
        }),
      }
    ),
    {
      name: 'map-store',
    }
  )
);
