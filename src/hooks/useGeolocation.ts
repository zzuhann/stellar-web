import { useState, useEffect, useCallback } from 'react';

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
  autoGetPosition?: boolean;
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
    maximumAge: 600000, // 10 分鐘內的快取位置可接受
    ...options,
  };

  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: '您的瀏覽器不支援地理位置功能',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

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
        let errorMessage = '無法取得您的位置';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒絕了位置權限請求，可以在瀏覽器設定中重新開啟';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '無法確定您的位置，請檢查網路連接';
            break;
          case error.TIMEOUT:
            errorMessage = '定位請求超時，請重試';
            break;
        }

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

  // 檢查權限狀態
  const checkPermission = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });
      setState((prev) => ({
        ...prev,
        hasPermission: permission.state === 'granted',
      }));
    } catch {
      // 某些瀏覽器可能不支援 permissions API，我們假設有權限
      setState((prev) => ({
        ...prev,
        hasPermission: true,
      }));
    }
  }, [state.isSupported]);

  // 自動嘗試取得位置（僅在組件首次載入時）
  useEffect(() => {
    if (state.isSupported && !state.latitude && !state.error && !state.isLoading) {
      checkPermission();
      if (options.autoGetPosition !== false) {
        getCurrentPosition();
      }
    }
  }, [state.isSupported, options.autoGetPosition, checkPermission, getCurrentPosition]);

  return {
    ...state,
    getCurrentPosition,
    checkPermission,
  };
}
