import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useParseCaptionMutation } from './useParseCaptionMutation';
import { importApi } from '@/lib/api';
import type { ParseCaptionResponse } from '@/types';

vi.mock('@/lib/api', () => ({
  importApi: { parseCaption: vi.fn() },
}));

// 這支 hook 只是 importApi.parseCaption 的薄包裝，「合併規則」與「這次新增了哪些欄位」
// 交給呼叫端（EventImportForm）處理，因此這裡只驗證 mutationFn 有把 caption 原封不動
// 傳給 importApi.parseCaption，以及 mutate 的成功/失敗結果能正確被呼叫端拿到。
vi.mock('@tanstack/react-query', () => ({
  useMutation: <TData, TVariables>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
  }) => {
    let isPending = false;
    return {
      get isPending() {
        return isPending;
      },
      mutate: (
        variables: TVariables,
        callbacks?: { onSuccess?: (data: TData) => void; onError?: (error: unknown) => void }
      ) => {
        isPending = true;
        options
          .mutationFn(variables)
          .then((data) => callbacks?.onSuccess?.(data))
          .catch((error) => callbacks?.onError?.(error))
          .finally(() => {
            isPending = false;
          });
      },
    };
  },
}));

const parseCaptionMock = vi.mocked(importApi.parseCaption);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useParseCaptionMutation', () => {
  it('mutate 時把 caption 原文傳給 importApi.parseCaption', async () => {
    const response: ParseCaptionResponse = {
      success: true,
      parsed: {
        title: '活動標題',
        artistName: null,
        eventDateStart: null,
        eventDateEnd: null,
        location: null,
        socialMedia: null,
      },
    };
    parseCaptionMock.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useParseCaptionMutation());
    const onSuccess = vi.fn();

    await act(async () => {
      result.current.mutate('貼文文案原文', { onSuccess });
      await Promise.resolve();
    });

    expect(parseCaptionMock).toHaveBeenCalledWith('貼文文案原文');
    expect(onSuccess).toHaveBeenCalledWith(response);
  });

  it('importApi.parseCaption reject 時，失敗會傳到呼叫端的 onError', async () => {
    const requestError = new Error('network error');
    parseCaptionMock.mockRejectedValueOnce(requestError);

    const { result } = renderHook(() => useParseCaptionMutation());
    const onError = vi.fn();

    await act(async () => {
      result.current.mutate('貼文文案原文', { onError });
      await Promise.resolve();
    });

    expect(onError).toHaveBeenCalledWith(requestError);
  });
});
