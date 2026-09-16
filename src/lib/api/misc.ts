import axios from 'axios';
import { PlacePrediction, PlaceDetails } from '@/types';
import api from './client';
import { ERROR_CODE_MESSAGES, FIELD_LABELS } from './errorCodes';

// 統一錯誤處理函數
export function handleApiError(error: unknown, fallbackMessage = '發生未知錯誤'): string {
  if (!axios.isAxiosError(error)) return fallbackMessage;

  const data = error.response?.data as
    | { error?: string; message?: string; code?: string; field?: string }
    | undefined;

  if (data?.code === 'VALIDATION_ERROR') {
    const fieldLabel = data.field ? FIELD_LABELS[data.field] : undefined;
    return fieldLabel ? `${fieldLabel}格式不正確，請確認後再試` : '輸入資料格式有誤，請確認後再試';
  }
  if (data?.code && ERROR_CODE_MESSAGES[data.code]) return ERROR_CODE_MESSAGES[data.code];
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error.response?.status === 401) return '請先登入後再試';
  if (error.response?.status === 403) return '權限不足';
  if (error.response?.status === 400) return '格式錯誤';
  return fallbackMessage;
}
export type ContactRequest = {
  name: string;
  email: string;
  message: string;
};

export const placesApi = {
  autocomplete: async (input: string): Promise<PlacePrediction[]> => {
    const response = await api.post<{ predictions: PlacePrediction[] }>('/places/autocomplete', {
      input,
    });
    return response.data.predictions ?? [];
  },

  getDetails: async (placeId: string): Promise<PlaceDetails> => {
    const response = await api.get<PlaceDetails>(`/places/details/${placeId}`);
    return response.data;
  },
};

export const contactApi = {
  submit: async (data: ContactRequest) => {
    const response = await api.post<{ success: true }>('/contact', data);
    return response.data;
  },
};
