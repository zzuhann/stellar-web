import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useAuthToken() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      setToken(idToken);
      return idToken;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Syncing local token state with Firebase's external auth object;
    // there's no way to derive this without setState in the effect.
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    user
      .getIdToken()
      .then((idToken) => {
        if (!cancelled) setToken(idToken);
      })
      .catch(() => {
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    token,
    loading,
    getToken,
    hasToken: !!token,
  };
}
