import axios, { AxiosError, AxiosHeaders } from 'axios';
import { auth } from '../firebase';
import { getAuthGeneration, notifyUnauthorized } from '../auth-events';

declare module 'axios' {
  interface AxiosRequestConfig {
    // 送出請求當下的登入世代版號，純前端記帳用，不會送到伺服器。
    __authGeneration?: number;
  }
}

const SESSION_ID_KEY = 'stellar_session_id';
// 同一個登入世代（generation）內，401 只處理一次，避免多個平行請求重複 signOut/toast。
// 世代切換（重新登入）後會自動重新解鎖，見回應攔截器。
let lastHandledUnauthorizedGeneration: number | null = null;

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
    // 記下送出當下的登入世代，必須在任何 await 之前、且不管下面成功與否都要設定：
    // 這個值要反映「這個請求開始送出那一刻」的登入狀態，不能被 getIdToken() 的等待時間差
    // 影響（等待期間使用者可能剛好重新登入），也不能因為 token 取得失敗而漏記
    // （漏記會讓這個請求之後合法的 401 被誤判成「沒有世代資訊」而忽略，該跳登入框卻沒跳）。
    config.__authGeneration = getAuthGeneration();

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
      const requestGeneration = error.config?.__authGeneration;
      const currentGeneration = getAuthGeneration();

      // 請求送出後、401 回來前登入狀態已經變了（例如已經重新登入）——
      // 這是一個跟現在無關的過期 401，忽略，不 signOut/彈登入框。
      if (
        requestGeneration === currentGeneration &&
        lastHandledUnauthorizedGeneration !== currentGeneration
      ) {
        lastHandledUnauthorizedGeneration = currentGeneration;
        auth.signOut().catch(() => {});
        notifyUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
