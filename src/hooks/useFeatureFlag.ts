import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { FeatureFlagName, FeatureFlagValue } from '@/constants';

interface FeatureFlagConfig {
  [key: string]: FeatureFlagValue;
}

// 預設配置 - 可以從環境變數或遠端 API 載入
const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  NOTIFICATIONS: 'admin',
  ANONYMOUS_LOGIN: 'all',
};

export function useFeatureFlag(flagName: FeatureFlagName) {
  const { userData, loading: authLoading } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 檢查權限邏輯
  const checkPermission = useCallback(
    (value: FeatureFlagValue): boolean => {
      if (value === 'all') return true;
      if (value === 'admin') return userData?.role === 'admin';
      return false;
    },
    [userData?.role]
  );

  // 載入功能標誌配置
  const loadFeatureFlags = async (): Promise<FeatureFlagConfig> => {
    try {
      // 優先從環境變數讀取
      if (typeof window !== 'undefined') {
        const envConfig = process.env.NEXT_PUBLIC_FEATURE_FLAGS;
        if (envConfig) {
          return JSON.parse(envConfig);
        }
      }

      return DEFAULT_FEATURE_FLAGS;
    } catch {
      return DEFAULT_FEATURE_FLAGS;
    }
  };

  useEffect(() => {
    const updateFeatureFlag = async () => {
      if (authLoading) return;

      try {
        setLoading(true);
        setError(null);

        const config = await loadFeatureFlags();
        const flagValue = config[flagName];

        if (flagValue) {
          const enabled = checkPermission(flagValue);
          setIsEnabled(enabled);
        } else {
          // 如果配置中沒有這個功能，預設為 false
          setIsEnabled(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    updateFeatureFlag();
  }, [flagName, userData?.role, authLoading, checkPermission]);

  return {
    isEnabled,
    loading,
    error,
    // 提供手動重新載入的方法
    refetch: () => {
      setLoading(true);
      loadFeatureFlags().then((config) => {
        const flagValue = config[flagName];
        setIsEnabled(flagValue ? checkPermission(flagValue) : false);
        setLoading(false);
      });
    },
  };
}
