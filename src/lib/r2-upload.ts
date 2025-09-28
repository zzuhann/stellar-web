// 圖片上傳到後端 API

import api from './api';

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
export async function uploadImageToAPI(file: File, authToken: string): Promise<UploadResponse> {
  try {
    // 先壓縮圖片
    const compressedFile = await compressImage(file);

    // 創建 FormData
    const formData = new FormData();
    formData.append('image', compressedFile);

    const response = await api.post('/images/upload', formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '上傳失敗',
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
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '刪除失敗',
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

    img.onload = () => {
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
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
