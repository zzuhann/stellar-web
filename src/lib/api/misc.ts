import axios from 'axios';
import { PlacePrediction, PlaceDetails } from '@/types';
import api from './client';

// 統一錯誤處理函數
export function handleApiError(error: unknown, fallbackMessage = '發生未知錯誤'): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.status === 401) {
      return '請先登入後再試';
    }
    if (error.response?.status === 403) {
      return '權限不足';
    }
    if (error.response?.status === 400) {
      return '格式錯誤';
    }
  }
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
