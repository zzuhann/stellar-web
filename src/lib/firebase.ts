// Firebase 配置與初始化

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'stellar-7b82b.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 初始化 Firebase App（singleton guard 避免 hot reload 重複初始化）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// 初始化 Firestore
export const db = getFirestore(app);

export const auth = getAuth(app);
if (process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  setPersistence(auth, browserLocalPersistence);
}

// 開發環境連接模擬器（目前停用，使用正式 Firebase 服務）
// if (process.env.NODE_ENV === 'development') {
//   // Auth Emulator
//   if (!auth.emulatorConfig) {
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//   }
//
//   // Firestore Emulator
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     // 忽略重複連接錯誤
//     console.log('Firestore emulator already connected');
//   }
// }

export default app;
