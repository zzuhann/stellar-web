'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getUserData } from './auth';
import { User as AppUser } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  toggleAuthModal: (redirectTo?: string, onAuthSuccess?: () => void) => void;
  redirectUrl: string | null;
  refetchUserData: () => Promise<void>;
  fetchUserDataByUid: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null); // 登入成功後要執行的動作

  const refetchUserData = useCallback(async () => {
    if (user) {
      const appUserData = await getUserData(user.uid);
      setUserData(appUserData);
    }
  }, [user]);

  const fetchUserDataByUid = useCallback(async (uid: string) => {
    const appUserData = await getUserData(uid);
    setUserData(appUserData);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 取得使用者詳細資料
        const appUserData = await getUserData(firebaseUser.uid);
        setUserData(appUserData);

        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [pendingAction]);

  const toggleAuthModal = (redirectTo?: string, onAuthSuccess?: () => void) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    if (onAuthSuccess) {
      setPendingAction(() => onAuthSuccess);
    }
    setAuthModalOpen(!authModalOpen);

    if (authModalOpen) {
      setRedirectUrl(null);
      setPendingAction(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch {}
  };

  const value = {
    user,
    userData,
    loading,
    signOut: handleSignOut,
    authModalOpen,
    toggleAuthModal,
    redirectUrl,
    refetchUserData,
    fetchUserDataByUid,
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
