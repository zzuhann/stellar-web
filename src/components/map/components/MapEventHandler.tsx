import { useMapStore } from '@/store/useMapStore';
import { useState, useRef, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';

// 地圖事件監聽器組件
const MapEventHandler = () => {
  const setCenter = useMapStore((state) => state.setCenter);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useMapEvents({
    dragstart: () => {
      if (isMountedRef.current) {
        setIsUserDragging(true);
      }
    },
    moveend: (e) => {
      // 只有在用戶手動拖動後才更新 store
      if (isUserDragging && isMountedRef.current) {
        try {
          const map = e.target;
          const center = map.getCenter();
          const zoom = map.getZoom();

          // 同步更新 store 中的 center 狀態
          setCenter({
            lat: center.lat,
            lng: center.lng,
            zoom: zoom,
          });

          setIsUserDragging(false);
        } catch {
          // 忽略地圖操作錯誤
        }
      }
    },
  });

  return null;
};

export default MapEventHandler;
