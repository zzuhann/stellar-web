import axios from 'axios';
import { ParseCaptionResponse, FetchImageResponse } from '@/types';
import api from './client';

// design-backend.md：parse-caption 的 Gemini/quota 類失敗回 200 + success:false，
// 但文案過長/空白（validateRequest 中介層）回 400、GEMINI_API_KEY 未設定回 503；
// fetch-image 則是「所有失敗都回 400（含 reason）或 503」，完全沒有走 200 的失敗分支。
// axios 對非 2xx 一律 reject，若不在這層攔截，呼叫端的 `.then()` 就永遠收不到失敗內容，
// 只能落入 `.catch()`，讓後端精心設計的 reason/message 全部遺失。這裡統一把「呼叫本身
// 完成、只是業務上失敗」正規化成一般的回傳值，讓 `.catch()` 只保留給真正的網路層例外。
function normalizeErrorResponse<T extends { success: false }>(error: unknown, fallback: T): T {
  if (
    axios.isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === 'object'
  ) {
    const data = error.response.data as Record<string, unknown>;
    if (data.success === false) return data as T;
    if (typeof data.error === 'string') return { ...fallback, error: data.error } as T;
    if (typeof data.message === 'string') return { ...fallback, message: data.message } as T;
  }
  return fallback;
}

// 活動貼文匯入（Phase A，僅供 admin 使用）
export const importApi = {
  // 貼文文案原文 → Gemini 結構化解析
  parseCaption: async (caption: string): Promise<ParseCaptionResponse> => {
    try {
      const response = await api.post<ParseCaptionResponse>('/import/parse-caption', { caption });
      return response.data;
    } catch (error) {
      return normalizeErrorResponse(error, { success: false as const });
    }
  },

  // 外部圖片網址 → 伺服器抓取存 R2
  fetchImage: async (imageUrl: string): Promise<FetchImageResponse> => {
    try {
      const response = await api.post<FetchImageResponse>('/import/fetch-image', { imageUrl });
      return response.data;
    } catch (error) {
      return normalizeErrorResponse(error, {
        success: false as const,
        error: '圖片抓取失敗，請重試',
      });
    }
  },
};
