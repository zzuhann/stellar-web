import { useMapStore } from '@/store/useMapStore';
import { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';

// 地圖中心點更新器組件
const MapCenterUpdater = () => {
  const center = useMapStore((state) => state.center);
  const map = useMapEvents({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (map && center && isMountedRef.current) {
      try {
        map.setView([center.lat, center.lng], center.zoom, {
          animate: true,
          duration: 0.5,
        });
      } catch {
        // 忽略地圖操作錯誤
      }
    }
  }, [map, center.lat, center.lng, center.zoom]);

  return null;
};

export default MapCenterUpdater;
