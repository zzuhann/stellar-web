import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapStore } from '@/store';
import { useEffect, useState } from 'react';
import { calculateDistance } from '../utils/calculateDistance';

const useMapLocation = () => {
  const { center, setCenter, resetMap, isDrawerExpanded } = useMapStore();

  // 是否應該自動定位到用戶位置
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);

  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
  } = useGeolocation({ autoGetPosition: true });

  // 判斷是否應該顯示定位按鈕
  const shouldShowLocationButton = () => {
    if (!latitude || !longitude) return false;
    if (isDrawerExpanded) return false;

    const distance = calculateDistance(center.lat, center.lng, latitude, longitude);

    // 如果距離超過 1 公里，顯示定位按鈕
    return distance > 1;
  };

  const handleLocateMe = () => {
    if (latitude && longitude) {
      setCenter({ lat: latitude, lng: longitude, zoom: 13 });
    }
  };

  // 取得用戶位置時，更新地圖中心（僅第一次）
  useEffect(() => {
    if (latitude && longitude && setCenter && shouldAutoCenter) {
      setCenter({ lat: latitude, lng: longitude, zoom: 8 });
      setShouldAutoCenter(false);
    }
  }, [latitude, longitude, setCenter, shouldAutoCenter]);

  // 離開頁面時重置地圖狀態
  useEffect(() => {
    return () => {
      resetMap();
    };
  }, [resetMap]);

  return {
    latitude,
    longitude,
    locationError,
    locationLoading,
    handleLocateMe,
    shouldShowLocationButton,
  };
};

export default useMapLocation;
