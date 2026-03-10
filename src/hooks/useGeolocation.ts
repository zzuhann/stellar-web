import { useState, useEffect, useCallback, useRef } from 'react';
import showToast from '@/lib/toast';
import { useIsInAppBrowser } from './useIsInAppBrowser';

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

  const { isInAppBrowser, loading: isInAppBrowserLoading } = useIsInAppBrowser();
  const hasAttemptedAutoGetRef = useRef(false);

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
        error: '無法取得你的位置',
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
        let errorMessage = '無法取得你的位置';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '因為你拒絕了位置權限請求，可以在瀏覽器設定中重新打開';
            break;
        }

        const toastMessage = `${errorMessage}${isInAppBrowser ? '。你目前在 app 內部瀏覽器中，建議外開瀏覽器才能順利定位喔！' : ''}`;
        showToast.error(toastMessage);

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
    isInAppBrowser,
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

  // 自動嘗試取得位置（僅在組件首次載入時，用 ref 避免 Strict Mode 或依賴變動導致重複觸發）
  useEffect(() => {
    if (hasAttemptedAutoGetRef.current) return;
    if (isInAppBrowserLoading) return;
    if (state.isSupported && !state.latitude && !state.error && !state.isLoading) {
      hasAttemptedAutoGetRef.current = true;
      checkPermission();
      if (options.autoGetPosition !== false) {
        getCurrentPosition();
      }
    }
  }, [
    isInAppBrowserLoading,
    state.isSupported,
    state.latitude,
    state.error,
    state.isLoading,
    options.autoGetPosition,
    checkPermission,
    getCurrentPosition,
  ]);

  return {
    ...state,
    getCurrentPosition,
    checkPermission,
  };
}
