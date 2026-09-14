import axios, { AxiosError, AxiosHeaders } from 'axios';
import { auth } from '../firebase';
import { notifyUnauthorized } from '../auth-events';

const SESSION_ID_KEY = 'stellar_session_id';
// leading-edge debounce: 平行請求同時 401 時只處理第一次，避免重複 signOut/toast
const UNAUTHORIZED_DEBOUNCE_MS = 1000;
let lastUnauthorizedHandledAt = 0;

function createRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;

    const next = createRequestId();
    window.sessionStorage.setItem(SESSION_ID_KEY, next);
    return next;
  } catch {
    return '';
  }
}

// 建立 Axios 實例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證 token
api.interceptors.request.use(
  async (config) => {
    try {
      const headers = AxiosHeaders.from(config.headers);

      headers.set('x-request-id', createRequestId());

      const sessionId = getOrCreateSessionId();
      if (sessionId) {
        headers.set('x-session-id', sessionId);
      }

      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
      }

      config.headers = headers;
    } catch {
      // ignore token fetch errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器 - 統一錯誤處理
api.interceptors.response.use(
  (response) => response, // 不標註型別，保留泛型推斷
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const now = Date.now();
      if (now - lastUnauthorizedHandledAt > UNAUTHORIZED_DEBOUNCE_MS) {
        lastUnauthorizedHandledAt = now;
        auth.signOut().catch(() => {});
        notifyUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
