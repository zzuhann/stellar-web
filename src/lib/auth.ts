import {
  User,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInAnonymously as firebaseSignInAnonymously,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User as AppUser } from '@/types';
import { FIREBASE_ERROR_MESSAGES } from '@/constants';

export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Google 登入
export async function signInWithGoogle(): Promise<
  | { user: User; error: null; redirecting?: false }
  | { user: null; error: string; redirecting?: false }
  | { user: null; error: null; redirecting: true }
> {
  const provider = new GoogleAuthProvider();

  // PWA 維持 redirect 流程，避免 standalone 模式下 popup 不穩定。
  if (isPWA()) {
    await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
    return { user: null, error: null, redirecting: true };
  }

  try {
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    await createUserDocument(result.user);
    return { user: result.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: FIREBASE_ERROR_MESSAGES[authError.code] || 'Google 登入失敗',
    };
  }
}

// 匿名登入
export async function signInAnonymously() {
  try {
    const result = await firebaseSignInAnonymously(auth);

    // 在 Firestore 中建立或更新使用者資料
    await createUserDocument(result.user);

    return { user: result.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: FIREBASE_ERROR_MESSAGES[authError.code] || '匿名登入失敗',
    };
  }
}

// 建立使用者文件
export async function createUserDocument(user: User): Promise<void> {
  const userDocRef = doc(db, 'users', user.uid);

  // 檢查使用者是否已存在
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return;
  }

  // 建立使用者資料
  const userData: Omit<AppUser, 'id'> = {
    email: user.email || '',
    displayName: user.displayName || (user.isAnonymous ? '訪客用戶' : ''),
    photoURL: user.photoURL || '',
    role: 'user', // 預設角色
    createdAt: new Date().toISOString(),
  };

  await setDoc(userDocRef, userData);
}

// 取得使用者資料
export async function getUserData(uid: string): Promise<AppUser | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: uid,
      ...userDoc.data(),
    } as AppUser;
  } catch {
    return null;
  }
}
