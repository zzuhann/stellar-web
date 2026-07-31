import { describe, expect, it, vi } from 'vitest';
import api from './client';
import { importApi } from './import';

vi.mock('./client', () => ({
  default: { post: vi.fn() },
}));

// axios 對非 2xx 一律 reject；模擬一個 AxiosError-like 物件（axios.isAxiosError 只檢查
// `isAxiosError === true`），確保 importApi 會把 response body 正規化成一般回傳值，
// 而不是讓呼叫端只能拿到「呼叫失敗」、丟失後端精心設計的 reason/message。
function axiosError(status: number, data: unknown) {
  return { isAxiosError: true, response: { status, data } };
}

describe('importApi.parseCaption', () => {
  it('200 成功時直接回傳 response body', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, parsed: { title: '活動標題' } },
    });

    const result = await importApi.parseCaption('文案');
    expect(result).toEqual({ success: true, parsed: { title: '活動標題' } });
  });

  it('503（GEMINI_API_KEY 未設定）被正規化成 success:false，不會被吃掉', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      axiosError(503, { success: false, error: 'AI 解析服務未設定' })
    );

    const result = await importApi.parseCaption('文案');
    expect(result).toEqual({ success: false, error: 'AI 解析服務未設定' });
  });

  it('400（validateRequest 中介層，caption 過長）被正規化成 success:false + message', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      axiosError(400, { error: '文案內容過長', code: 'VALIDATION_FAILED', field: 'caption' })
    );

    const result = await importApi.parseCaption('文案');
    expect(result).toEqual({ success: false, error: '文案內容過長' });
  });

  it('沒有可用的 response body（純網路層錯誤）時回傳通用失敗物件，不 throw', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('network error'));

    const result = await importApi.parseCaption('文案');
    expect(result).toEqual({ success: false });
  });
});

describe('importApi.fetchImage', () => {
  it('200 成功時直接回傳 response body', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, imageUrl: 'https://cdn.example.com/a.jpg', filename: 'a.jpg' },
    });

    const result = await importApi.fetchImage('https://source.jpg');
    expect(result).toEqual({
      success: true,
      imageUrl: 'https://cdn.example.com/a.jpg',
      filename: 'a.jpg',
    });
  });

  it('400（抓取失敗，帶 reason）被正規化成 success:false，reason 不遺失', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      axiosError(400, { success: false, error: '網址已失效', reason: 'fetch_failed' })
    );

    const result = await importApi.fetchImage('https://source.jpg');
    expect(result).toEqual({ success: false, error: '網址已失效', reason: 'fetch_failed' });
  });

  it('503（R2 未設定）被正規化成 success:false', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      axiosError(503, { success: false, error: '圖片上傳服務未設定' })
    );

    const result = await importApi.fetchImage('https://source.jpg');
    expect(result).toEqual({ success: false, error: '圖片上傳服務未設定' });
  });

  it('沒有可用的 response body（純網路層錯誤）時回傳通用失敗物件，不 throw', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('network error'));

    const result = await importApi.fetchImage('https://source.jpg');
    expect(result).toEqual({ success: false, error: '圖片抓取失敗，請重試' });
  });
});
