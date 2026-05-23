'use client';

import { useCallback } from 'react';

interface MapRestoreState {
  mode: 'map' | 'list';
  sheetHeight: number;
  carouselScrollLeft: number;
  listScrollTop: number;
  savedAt: number;
}

const TTL = 30_000; // 30 seconds

function getKey(artistId: string) {
  return `stellar_map_state_${artistId}`;
}

export function useMapStateStorage(artistId: string) {
  const saveState = useCallback(
    (state: Omit<MapRestoreState, 'savedAt'>) => {
      try {
        sessionStorage.setItem(getKey(artistId), JSON.stringify({ ...state, savedAt: Date.now() }));
      } catch (_e) {}
    },
    [artistId]
  );

  const consumeRestoredState = useCallback((): MapRestoreState | null => {
    try {
      const raw = sessionStorage.getItem(getKey(artistId));
      if (!raw) return null;
      const data = JSON.parse(raw) as MapRestoreState;
      if (Date.now() - data.savedAt > TTL) {
        sessionStorage.removeItem(getKey(artistId));
        return null;
      }
      sessionStorage.removeItem(getKey(artistId));
      return data;
    } catch {
      return null;
    }
  }, [artistId]);

  return { saveState, consumeRestoredState };
}
