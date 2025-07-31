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
    if (user) {
      getToken();
    } else {
      setToken(null);
    }
  }, [user]);

  return {
    token,
    loading,
    getToken,
    hasToken: !!token,
  };
}
