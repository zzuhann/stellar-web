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

  it('reset 後，稍早那次仍在飛行中的請求回應時不會再套用（例如管理員先移除了封面圖）', async () => {
    let resolvePending!: (value: { success: true; imageUrl: string; filename: string }) => void;
    fetchImageMock.mockImplementationOnce(
      () => new Promise((resolve) => (resolvePending = resolve))
    );

    const onApply = vi.fn();
    const { result } = renderHook(() => useCoverImageUrlFetch(() => true, onApply));

    act(() => {
      result.current.fetchUrl('https://source.jpg');
    });
    expect(result.current.status).toBe('loading');

    act(() => {
      result.current.reset(); // 管理員在抓取完成前移除了封面圖
    });
    expect(result.current.status).toBe('idle');

    await act(async () => {
      resolvePending({
        success: true,
        imageUrl: 'https://cdn.example.com/late.jpg',
        filename: 'late.jpg',
      });
      await Promise.resolve();
    });

    expect(onApply).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('連續觸發兩次抓取時，較舊、較晚回應的請求不會覆蓋較新一次的結果', async () => {
    let resolveFirst!: (value: { success: true; imageUrl: string; filename: string }) => void;
    let resolveSecond!: (value: { success: true; imageUrl: string; filename: string }) => void;

    fetchImageMock
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)));

    const onApply = vi.fn();
    const { result } = renderHook(() => useCoverImageUrlFetch(() => true, onApply));

    act(() => {
      result.current.fetchUrl('https://first.jpg');
    });
    act(() => {
      result.current.fetchUrl('https://second.jpg'); // 管理員在第一次還沒回應前就貼了第二個網址
    });

    await act(async () => {
      resolveSecond({
        success: true,
        imageUrl: 'https://cdn.example.com/second.jpg',
        filename: 'second.jpg',
      });
      await Promise.resolve();
    });
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith('https://cdn.example.com/second.jpg');

    await act(async () => {
      resolveFirst({
        success: true,
        imageUrl: 'https://cdn.example.com/first.jpg',
        filename: 'first.jpg',
      });
      await Promise.resolve();
    });
    // 較舊的回應姍姍來遲，不應該再次套用、覆蓋掉較新的結果
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('success');
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
