import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImageUrlQueue } from './useImageUrlQueue';
import { importApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  importApi: {
    fetchImage: vi.fn(),
  },
}));

const fetchImageMock = vi.mocked(importApi.fetchImage);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useImageUrlQueue', () => {
  it('enqueue 後每個網址各自獨立呈現 loading，成功後個別轉為 success', async () => {
    fetchImageMock.mockImplementation((url: string) =>
      Promise.resolve({ success: true, imageUrl: `https://cdn.example.com/${url}`, filename: url })
    );

    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['https://a.jpg', 'https://b.jpg']);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.every((item) => item.status === 'loading')).toBe(true);

    await waitFor(() => {
      expect(result.current.items.every((item) => item.status === 'success')).toBe(true);
    });

    expect(result.current.successUrls).toEqual([
      'https://cdn.example.com/https://a.jpg',
      'https://cdn.example.com/https://b.jpg',
    ]);
  });

  it('部分失敗不影響其他項目，失敗項目保留在清單中並顯示原因', async () => {
    fetchImageMock.mockImplementation((url: string) => {
      if (url === 'https://bad.jpg') {
        return Promise.resolve({ success: false, error: 'x', reason: 'fetch_failed' as const });
      }
      return Promise.resolve({
        success: true,
        imageUrl: 'https://cdn.example.com/ok.jpg',
        filename: 'ok.jpg',
      });
    });

    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['https://ok.jpg', 'https://bad.jpg']);
    });

    await waitFor(() => {
      const bad = result.current.items.find((item) => item.sourceUrl === 'https://bad.jpg');
      expect(bad?.status).toBe('error');
    });

    const ok = result.current.items.find((item) => item.sourceUrl === 'https://ok.jpg');
    const bad = result.current.items.find((item) => item.sourceUrl === 'https://bad.jpg');

    expect(ok?.status).toBe('success');
    expect(bad?.status).toBe('error');
    expect(bad?.errorMessage).toBe('網址已失效，請確認來源是否還存在');
    expect(result.current.items).toHaveLength(2); // 失敗項目不會被靜默移除
  });

  it('重試失敗項目：成功後原地替換成 success', async () => {
    fetchImageMock.mockResolvedValueOnce({ success: false, error: 'x', reason: 'fetch_failed' });

    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['https://retry.jpg']);
    });

    await waitFor(() => {
      expect(result.current.items[0].status).toBe('error');
    });

    const id = result.current.items[0].id;
    fetchImageMock.mockResolvedValueOnce({
      success: true,
      imageUrl: 'https://cdn.example.com/retry.jpg',
      filename: 'retry.jpg',
    });

    act(() => {
      result.current.retry(id);
    });

    expect(result.current.items[0].status).toBe('loading');

    await waitFor(() => {
      expect(result.current.items[0].status).toBe('success');
    });
    expect(result.current.items[0].resultUrl).toBe('https://cdn.example.com/retry.jpg');
    expect(fetchImageMock).toHaveBeenCalledTimes(2);
  });

  it('連續重試時，較舊、較晚回應的請求不會覆蓋較新一次重試的結果', async () => {
    let resolveFirst!: (value: { success: true; imageUrl: string; filename: string }) => void;
    let resolveSecond!: (value: { success: true; imageUrl: string; filename: string }) => void;

    fetchImageMock
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)));

    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['https://race.jpg']);
    });
    const id = result.current.items[0].id;

    act(() => {
      result.current.retry(id); // 第二次請求（第一次 enqueue 本身就是第一次請求）
    });

    // 第二次（較新）請求先回應
    await act(async () => {
      resolveSecond({
        success: true,
        imageUrl: 'https://cdn.example.com/second.jpg',
        filename: 'second.jpg',
      });
      await Promise.resolve();
    });
    expect(result.current.items[0].resultUrl).toBe('https://cdn.example.com/second.jpg');

    // 第一次（較舊）請求才姍姍來遲地回應，不應覆蓋掉較新的結果
    await act(async () => {
      resolveFirst({
        success: true,
        imageUrl: 'https://cdn.example.com/first.jpg',
        filename: 'first.jpg',
      });
      await Promise.resolve();
    });
    expect(result.current.items[0].resultUrl).toBe('https://cdn.example.com/second.jpg');
  });

  it('移除項目：不影響其他仍在處理中或已成功的項目', async () => {
    fetchImageMock.mockImplementation(() => new Promise(() => {})); // 永遠 pending

    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['https://a.jpg', 'https://b.jpg']);
    });

    const [first, second] = result.current.items;

    act(() => {
      result.current.remove(first.id);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(second.id);
  });

  it('同一個事件處理常式內先 remove 再 retry 同一個 id：不會為已移除的項目發送請求', async () => {
    fetchImageMock.mockResolvedValue({
      success: true,
      imageUrl: 'https://cdn.example.com/x.jpg',
      filename: 'x.jpg',
    });

    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['https://removed.jpg']);
    });
    await waitFor(() => expect(result.current.items[0].status).toBe('success'));
    const id = result.current.items[0].id;
    fetchImageMock.mockClear();

    act(() => {
      result.current.remove(id);
      result.current.retry(id); // retry 讀到的應該是 remove 之後、已經不存在這個 id 的最新狀態
    });

    expect(result.current.items).toHaveLength(0);
    expect(fetchImageMock).not.toHaveBeenCalled();
  });

  it('沒有輸入任何網址時不建立佇列項目', () => {
    const { result } = renderHook(() => useImageUrlQueue());

    act(() => {
      result.current.enqueue(['', '   ']);
    });

    expect(result.current.items).toHaveLength(0);
  });
});
