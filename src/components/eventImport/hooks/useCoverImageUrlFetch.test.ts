import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCoverImageUrlFetch } from './useCoverImageUrlFetch';
import { importApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  importApi: { fetchImage: vi.fn() },
}));

const fetchImageMock = vi.mocked(importApi.fetchImage);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCoverImageUrlFetch', () => {
  it('mainImage 目前為空時，成功抓取後套用', async () => {
    fetchImageMock.mockResolvedValueOnce({
      success: true,
      imageUrl: 'https://cdn.example.com/cover.jpg',
      filename: 'cover.jpg',
    });
    const onApply = vi.fn();

    const { result } = renderHook(() => useCoverImageUrlFetch(() => true, onApply));

    act(() => {
      result.current.fetchUrl('https://source.jpg');
    });
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(onApply).toHaveBeenCalledWith('https://cdn.example.com/cover.jpg');
  });

  it('mainImage 已有值時，成功抓取但不套用，狀態為 skipped', async () => {
    fetchImageMock.mockResolvedValueOnce({
      success: true,
      imageUrl: 'https://cdn.example.com/cover.jpg',
      filename: 'cover.jpg',
    });
    const onApply = vi.fn();

    const { result } = renderHook(() => useCoverImageUrlFetch(() => false, onApply));

    act(() => {
      result.current.fetchUrl('https://source.jpg');
    });

    await waitFor(() => expect(result.current.status).toBe('skipped'));
    expect(onApply).not.toHaveBeenCalled();
  });

  it('抓取失敗時顯示對應錯誤原因，不套用', async () => {
    fetchImageMock.mockResolvedValueOnce({
      success: false,
      error: 'x',
      reason: 'invalid_content_type',
    });
    const onApply = vi.fn();

    const { result } = renderHook(() => useCoverImageUrlFetch(() => true, onApply));

    act(() => {
      result.current.fetchUrl('https://source.jpg');
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toBe('這個網址不是圖片，請確認貼的是圖片直連');
    expect(onApply).not.toHaveBeenCalled();
  });

  it('reset 會清除狀態與錯誤訊息', async () => {
    fetchImageMock.mockResolvedValueOnce({ success: false, error: 'x' });
    const { result } = renderHook(() => useCoverImageUrlFetch(() => true, vi.fn()));

    act(() => {
      result.current.fetchUrl('https://source.jpg');
    });
    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('空字串不會觸發抓取', () => {
    const { result } = renderHook(() => useCoverImageUrlFetch(() => true, vi.fn()));
    act(() => {
      result.current.fetchUrl('   ');
    });
    expect(fetchImageMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });
});
