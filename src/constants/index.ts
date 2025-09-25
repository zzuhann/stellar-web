// API 端點
export const API_ENDPOINTS = {
  ARTISTS: '/api/artists',
  EVENTS: '/api/events',
  AUTH: '/api/auth',
} as const;

// 台灣地圖預設中心點
export const TAIWAN_MAP_CENTER = {
  lat: 23.8,
  lng: 120.9,
  zoom: 8,
} as const;

// 使用者角色
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// 本地存儲鍵值
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  MAP_CENTER: 'mapCenter',
} as const;

// Firebase 錯誤訊息對應
export const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': '找不到此用戶',
  'auth/wrong-password': '密碼錯誤',
  'auth/email-already-in-use': '此 Email 已被使用',
  'auth/weak-password': '密碼強度不足',
  'auth/invalid-email': 'Email 格式錯誤',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試',
};

// 預設分頁設定
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// CDN 域名
export const CDN_DOMAIN = 'https://cdn.stellar-zone.com/';

// 功能標誌
export const FEATURE_FLAGS = {
  NOTIFICATIONS: 'NOTIFICATIONS',
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = 'admin' | 'all';
