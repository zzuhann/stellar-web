import { useState, useCallback, useMemo, useLayoutEffect, useRef } from 'react';

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

  const defaultOptions: PositionOptions = useMemo(
    () => ({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 600000,
      ...options,
    }),
    [options]
  );

  const isSupportedRef = useRef(state.isSupported);
  useLayoutEffect(() => {
    isSupportedRef.current = state.isSupported;
  }, [state.isSupported]);

  const getCurrentPosition = useCallback(() => {
    if (!isSupportedRef.current) return;

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
        const errorMessage =
          error.code === error.PERMISSION_DENIED
            ? '因為你拒絕了位置權限請求，可以在瀏覽器設定中重新打開'
            : '無法取得你的位置';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          hasPermission: error.code !== error.PERMISSION_DENIED,
        }));
      },
      defaultOptions
    );
  }, [defaultOptions]);

  const checkPermission = useCallback(async () => {
    if (!isSupportedRef.current) return;

    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });
      setState((prev) => ({ ...prev, hasPermission: permission.state === 'granted' }));
    } catch {
      setState((prev) => ({ ...prev, hasPermission: true }));
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    checkPermission,
  };
}
