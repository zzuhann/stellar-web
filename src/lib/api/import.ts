import { ParseCaptionResponse, FetchImageResponse } from '@/types';
import api from './client';

// 活動貼文匯入（Phase A，僅供 admin 使用）
export const importApi = {
  // 貼文文案原文 → Gemini 結構化解析
  parseCaption: async (caption: string): Promise<ParseCaptionResponse> => {
    const response = await api.post<ParseCaptionResponse>('/import/parse-caption', { caption });
    return response.data;
  },

  // 外部圖片網址 → 伺服器抓取存 R2
  fetchImage: async (imageUrl: string): Promise<FetchImageResponse> => {
    const response = await api.post<FetchImageResponse>('/import/fetch-image', { imageUrl });
    return response.data;
  },
};
