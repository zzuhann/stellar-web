import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';
import { useMapStore } from '@/store';
import { useEffect, useRef } from 'react';
import { calculateDistance } from '../utils/calculateDistance';

// module-level 才能撐過 Strict Mode 的 unmount/remount（ref 會重置）
let hasAttemptedAutoGet = false;

const useMapLocation = () => {
  const { center, setCenter, resetMap, isDrawerExpanded } = useMapStore();
  const hasAutoCenteredRef = useRef(false);
  const { loading: isInAppBrowserLoading } = useIsInAppBrowser();

  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
    isSupported,
    getCurrentPosition,
  } = useGeolocation();

  // 等待 IAB 偵測完成後，自動嘗試取得位置一次
  useEffect(() => {
    if (hasAttemptedAutoGet) return;
    if (isInAppBrowserLoading) return;
    if (!isSupported || latitude || locationError || locationLoading) return;

    hasAttemptedAutoGet = true;
     
    getCurrentPosition();
  }, [
    isInAppBrowserLoading,
    isSupported,
    latitude,
    locationError,
    locationLoading,
    getCurrentPosition,
  ]);

  const shouldShowLocationButton = () => {
    if (isDrawerExpanded) return false;
    if (!latitude || !longitude) return true;

    const distance = calculateDistance(center.lat, center.lng, latitude, longitude);
    return distance > 1;
  };

  const handleLocateMe = () => {
    if (latitude && longitude) {
      setCenter({ lat: latitude, lng: longitude, zoom: 13 });
    } else {
      getCurrentPosition();
    }
  };

  useEffect(() => {
    if (hasAutoCenteredRef.current) return;
    if (latitude && longitude && setCenter) {
      hasAutoCenteredRef.current = true;
      setCenter({ lat: latitude, lng: longitude, zoom: 8 });
    }
  }, [latitude, longitude, setCenter]);

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
