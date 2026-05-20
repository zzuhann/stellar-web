import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';
import { useEffect } from 'react';

// module-level flag to survive Strict Mode unmount/remount (ref would reset)
let hasAttemptedAutoGet = false;

const useMapNewLocation = () => {
  const { loading: isInAppBrowserLoading } = useIsInAppBrowser();

  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
    isSupported,
    getCurrentPosition,
  } = useGeolocation();

  // Auto-attempt to get GPS position once after IAB detection completes
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

  return {
    latitude,
    longitude,
    locationError,
    locationLoading,
    getCurrentPosition,
  };
};

export default useMapNewLocation;
