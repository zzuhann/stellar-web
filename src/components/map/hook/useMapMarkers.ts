import { useMapStore } from '@/store/useMapStore';
import { MapEvent } from '@/types';
import { useMemo } from 'react';
import { createImageIcon } from '../utils/createImageIcon';

type UseMapMarkersProps = {
  mapEvents: MapEvent[];
};

const useMapMarkers = ({ mapEvents }: UseMapMarkersProps) => {
  const selectedEventId = useMapStore((state) => state.selectedEventId);

  // 將同地點的活動分組
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, MapEvent[]>();

    mapEvents.forEach((event) => {
      const key = `${event.location.coordinates.lat.toFixed(6)}_${event.location.coordinates.lng.toFixed(6)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(event);
    });

    return groups;
  }, [mapEvents]);

  // 暫存所有 marker，只在 events 或 selectedEventId 變化時重新計算
  const markerIcons = useMemo(() => {
    const iconCache = new Map();

    mapEvents.forEach((event) => {
      const isSelected = selectedEventId === event.id;
      const cacheKey = `${event.mainImage || 'default'}_${isSelected}`;

      if (!iconCache.has(cacheKey)) {
        iconCache.set(cacheKey, createImageIcon(event.mainImage, isSelected));
      }
    });

    return iconCache;
  }, [mapEvents, selectedEventId]);

  return {
    groupedEvents,
    markerIcons,
  };
};

export default useMapMarkers;
