// Firebase 配置與初始化

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// authDomain 必須與使用者實際所在的 host 一致，popup 才能把結果傳回 opener。
// 若設成 apex（stellar-zone.com）但站點在 www，handler 會 307 跳轉，signInWithPopup 可能永遠不 resolve。
function resolveAuthDomain(): string {
  const fallback = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'stellar-7b82b.firebaseapp.com';

  if (typeof window === 'undefined') {
    return fallback;
  }

  const { hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'stellar-7b82b.firebaseapp.com';
  }

  // Vercel preview deployments — not in Firebase Authorized Domains, fall back to default
  if (hostname.endsWith('.vercel.app')) {
    return 'stellar-7b82b.firebaseapp.com';
  }

  return hostname;
}

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: resolveAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 初始化 Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const isBrowser = typeof window !== 'undefined';

// SSR 環境不能初始化 browser-only auth 依賴，否則會觸發 Firebase internal assertion。
// 瀏覽器端才使用 redirect/popup 所需 resolver 與 persistence 設定。
export const auth = isBrowser
  ? initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    })
  : getAuth(app);

// 初始化 Firestore
export const db = getFirestore(app);

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
