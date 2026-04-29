import { useState, useCallback } from 'react';
import showToast from '@/lib/toast';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  hasPermission: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isLoading: false,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    hasPermission: false,
  });

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 600000,
    ...options,
  };

  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: '無法取得你的位置' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isLoading: false,
          error: null,
          isSupported: true,
          hasPermission: true,
        });
      },
      (error) => {
        let errorMessage = '無法取得你的位置';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = '因為你拒絕了位置權限請求，可以在瀏覽器設定中重新打開';
        }

        showToast.error(errorMessage);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          hasPermission: error.code !== error.PERMISSION_DENIED,
        }));
      },
      defaultOptions
    );
  }, [
    state.isSupported,
    defaultOptions.enableHighAccuracy,
    defaultOptions.timeout,
    defaultOptions.maximumAge,
  ]);

  const checkPermission = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });
      setState((prev) => ({ ...prev, hasPermission: permission.state === 'granted' }));
    } catch {
      setState((prev) => ({ ...prev, hasPermission: true }));
    }
  }, [state.isSupported]);

  return {
    ...state,
    getCurrentPosition,
    checkPermission,
  };
}
