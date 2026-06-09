'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getUserData, createUserDocument } from './auth';
import { User as AppUser } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  authModalOpen: boolean;
  toggleAuthModal: (redirectTo?: string, onAuthSuccess?: () => void) => void;
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
      setUser(firebaseUser);

      if (firebaseUser) {
        let appUserData = await getUserData(firebaseUser.uid);
        if (!appUserData) {
          try {
            await createUserDocument(firebaseUser);
          } catch {
            // User doc creation failed, user is still authenticated
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

  const toggleAuthModal = (redirectTo?: string, onAuthSuccess?: () => void) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    if (onAuthSuccess) {
      pendingActionRef.current = onAuthSuccess;
    }
    setAuthModalOpen(!authModalOpen);

    if (authModalOpen) {
      setRedirectUrl(null);
      pendingActionRef.current = null;
    }
  };

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
