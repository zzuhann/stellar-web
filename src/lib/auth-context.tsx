'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import * as Sentry from '@sentry/nextjs';
import { auth } from './firebase';
import { getUserData, createUserDocument } from './auth';
import { bumpAuthGeneration, subscribeUnauthorized } from './auth-events';
import { User as AppUser } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  openAuthModal: (redirectTo?: string, onAuthSuccess?: () => void) => void;
  closeAuthModal: () => void;
  redirectUrl: string | null;
  refetchUserData: (uid?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const refetchUserData = useCallback(
    async (uid?: string) => {
      const targetUid = uid ?? user?.uid;
      if (targetUid) {
        const appUserData = await getUserData(targetUid);
        setUserData(appUserData);
      }
    },
    [user]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 每次觸發（登入或登出）都遞增版號，讓 401 攔截器能判斷請求送出當下的
      // 登入狀態是否已經改變（例如舊 token 的 401 在重新登入後才回來）。
      bumpAuthGeneration();
      setUser(firebaseUser);

      if (firebaseUser) {
        let appUserData = await getUserData(firebaseUser.uid);
        if (!appUserData) {
          try {
            await createUserDocument(firebaseUser);
          } catch (e) {
            Sentry.captureException(e, { tags: { context: 'auth_createUserDocument' } });
          }
          appUserData = await getUserData(firebaseUser.uid);
        }
        setUserData(appUserData);

        if (pendingActionRef.current) {
          pendingActionRef.current();
          pendingActionRef.current = null;
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 明確的開/關而非 toggle:同一個 effect 在 React Strict Mode 下會被連續呼叫兩次，
  // 若用 prev => !prev 純切換，兩次呼叫會互相抵銷（true → false）導致 modal 永遠不出現。
  const openAuthModal = useCallback((redirectTo?: string, onAuthSuccess?: () => void) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    if (onAuthSuccess) {
      pendingActionRef.current = onAuthSuccess;
    }
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setRedirectUrl(null);
    pendingActionRef.current = null;
    setAuthModalOpen(false);
  }, []);

  useEffect(() => {
    return subscribeUnauthorized(() => {
      pendingActionRef.current = null;
      setRedirectUrl(null);
      setAuthModalOpen(true);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch {
      // noop
    }
  };

  const value = {
    user,
    userData,
    loading,
    signOut: handleSignOut,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    redirectUrl,
    refetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
