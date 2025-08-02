// Firebase 認證工具函數

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User as AppUser } from '@/types';
import { FIREBASE_ERROR_MESSAGES } from '@/constants';

// 登入
export async function signIn(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: FIREBASE_ERROR_MESSAGES[authError.code] || '登入失敗',
    };
  }
}

// Google 登入
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // 在 Firestore 中建立或更新使用者資料
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

// 註冊
export async function signUp(email: string, password: string, displayName?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // 更新顯示名稱
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    // 在 Firestore 中建立使用者資料
    await createUserDocument(result.user);

    return { user: result.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: FIREBASE_ERROR_MESSAGES[authError.code] || '註冊失敗',
    };
  }
}

// 登出
export async function signOutUser() {
  try {
    await signOut(auth);
    return { error: null };
  } catch {
    return { error: '登出失敗' };
  }
}

// 重設密碼
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return {
      error: FIREBASE_ERROR_MESSAGES[authError.code] || '重設密碼失敗',
    };
  }
}

// 建立使用者文件
async function createUserDocument(user: User): Promise<void> {
  const userDocRef = doc(db, 'users', user.uid);

  // 檢查使用者是否已存在
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return;
  }

  // 建立使用者資料
  const userData: Omit<AppUser, 'id'> = {
    email: user.email!,
    displayName: user.displayName || '',
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

// 檢查是否為管理員
export async function isAdmin(uid: string): Promise<boolean> {
  const userData = await getUserData(uid);
  return userData?.role === 'admin';
}
