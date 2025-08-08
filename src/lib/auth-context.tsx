'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
  toggleAuthModal: (redirectTo?: string) => void;
  redirectUrl?: string;
  refetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>();

  const refetchUserData = useCallback(async () => {
    if (user) {
      const appUserData = await getUserData(user.uid);
      setUserData(appUserData);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 取得使用者詳細資料
        const appUserData = await getUserData(firebaseUser.uid);
        setUserData(appUserData);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleAuthModal = (redirectTo?: string) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    setAuthModalOpen(!authModalOpen);

    // 當關閉模態框時清除重定向 URL
    if (authModalOpen) {
      setRedirectUrl(undefined);
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
