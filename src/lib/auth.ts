import { User, AuthError, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User as AppUser } from '@/types';
import { FIREBASE_ERROR_MESSAGES } from '@/constants';

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
    email: user.email || '',
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
