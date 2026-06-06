import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';
import { useEffect, useRef } from 'react';

const useMapNewLocation = () => {
  // useRef resets on unmount, so each map page visit triggers a fresh GPS attempt.
  // This differs from the old useMapLocation which used a module-level flag that
  // persisted across page navigations and prevented GPS on subsequent visits.
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

  // Auto-attempt to get GPS position once after IAB detection completes
  useEffect(() => {
    if (hasAttemptedAutoGetRef.current) return;
    if (isInAppBrowserLoading) return;
    if (!isSupported || latitude || locationError || locationLoading) return;

    hasAttemptedAutoGetRef.current = true;
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
