// 圖片上傳到後端 API

import axios from 'axios';
import api from './api';
import { handleApiError } from './api/misc';

export const UPLOAD_TIMEOUT_MS = 60000;
export const UPLOAD_NO_RESPONSE_MESSAGE = '可能遇到伺服器或網路問題，請稍後重試';
// Under the API's 5MB multer limit with room for multipart overhead
const COMPRESSED_MAX_BYTES = 4.5 * 1024 * 1024;

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  filename?: string;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

// 上傳圖片到後端 API
// Callers that already ran compressImage with their own size/quality pass compress: false,
// otherwise this second lossy pass shrinks their output back to 800px
export async function uploadImageToAPI(
  file: File,
  authToken?: string,
  endpoint = '/images/upload',
  { compress = true }: { compress?: boolean } = {}
): Promise<UploadResponse> {
  try {
    const body = compress ? await compressImage(file) : file;

    // 創建 FormData
    const formData = new FormData();
    formData.append('image', body);

    const response = await api.post(endpoint, formData, {
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        'Content-Type': 'multipart/form-data',
      },
      // The global 10s timeout aborts uploads on slow mobile networks (Sentry WEB-27)
      timeout: UPLOAD_TIMEOUT_MS,
    });

    return response.data;
  } catch (error) {
    // No response at all: timed out or the connection dropped
    if (axios.isAxiosError(error) && !error.response) {
      return { success: false, error: UPLOAD_NO_RESPONSE_MESSAGE };
    }
    return {
      success: false,
      error: handleApiError(error, '上傳失敗'),
    };
  }
}

// 從後端 API 刪除圖片
export async function deleteImageFromAPI(
  imageUrl: string,
  authToken: string
): Promise<DeleteResponse> {
  try {
    const response = await api.delete('/images/delete', {
      data: { imageUrl },
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error, '刪除失敗'),
    };
  }
}

// 檢查服務狀態
export async function checkImageServiceStatus(): Promise<{ available: boolean; message: string }> {
  try {
    const response = await api.get('/images/status');

    return response.data;
  } catch {
    return {
      available: false,
      message: '服務暫時不可用',
    };
  }
}

// 圖片壓縮功能
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const src = URL.createObjectURL(file);

    // Undecodable image: upload the original and let the server reject it, rather than hang
    img.onerror = () => {
      URL.revokeObjectURL(src);
      resolve(file);
    };
    img.onload = () => {
      // No 2D context (low-memory WebView): drawing would upload a blank canvas
      if (!ctx) {
        URL.revokeObjectURL(src);
        resolve(file);
        return;
      }

      // 計算新尺寸，保持寬高比
      let { width, height } = img;

      // 計算縮放比例，取寬度和高度的較小值
      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;
      const scale = Math.min(scaleX, scaleY, 1); // 不放大，只縮小

      if (scale < 1) {
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;

      // 繪製並壓縮圖片
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(src);

      // Label with the encoded type: Safari can't encode WebP and returns PNG, which the API's
      // magic-byte check rejects when labelled image/webp
      const finish = (blob: Blob | null) =>
        resolve(
          blob ? new File([blob], file.name, { type: blob.type, lastModified: Date.now() }) : file
        );
      canvas.toBlob(
        (blob) => {
          // PNG ignores quality, so a large noisy photo can exceed the API's 5MB limit
          if (blob && blob.size > COMPRESSED_MAX_BYTES && blob.type !== 'image/jpeg') {
            canvas.toBlob(finish, 'image/jpeg', quality);
            return;
          }
          finish(blob);
        },
        file.type,
        quality
      );
    };

    img.src = src;
  });
}
