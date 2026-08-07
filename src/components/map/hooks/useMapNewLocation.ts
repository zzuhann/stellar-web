import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';
import { useEffect, useRef } from 'react';

const useMapNewLocation = () => {
  const hasAttemptedAutoGetRef = useRef(false);
  const { loading: isInAppBrowserLoading } = useIsInAppBrowser();

  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
    isSupported,
    getCurrentPosition,
  } = useGeolocation();

  const getCurrentPositionRef = useRef(getCurrentPosition);
  useEffect(() => {
    getCurrentPositionRef.current = getCurrentPosition;
  }, [getCurrentPosition]);

  // Auto-attempt to get GPS position once after IAB detection completes
  useEffect(() => {
    if (hasAttemptedAutoGetRef.current) return;
    if (isInAppBrowserLoading) return;
    if (!isSupported || latitude || locationError || locationLoading) return;

    hasAttemptedAutoGetRef.current = true;
    getCurrentPositionRef.current();
  }, [isInAppBrowserLoading, isSupported, latitude, locationError, locationLoading]);

  return {
    latitude,
    longitude,
    locationError,
    locationLoading,
    getCurrentPosition,
  };
};

export default useMapNewLocation;
