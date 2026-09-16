import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { defaultQueryRetry } from './query-client';

function buildAxios401(): AxiosError {
  return new AxiosError(
    'Unauthorized',
    undefined,
    undefined,
    undefined,
    // response 只需要 retry 邏輯會讀的 status 欄位
    { status: 401 } as never
  );
}

// PlaceAutocomplete 原本用 retry: 2（單純數字）蓋掉這條全域規則，401 也照樣重試，
// 重試的請求會帶新的 auth generation，可能誤觸發多餘的登入提示。
// 拿掉客製化、改沿用這條全域規則後，靠這個測試證明 401 真的不會重試。
describe('defaultQueryRetry — QueryProvider 全域重試規則', () => {
  it('401 不重試', () => {
    expect(defaultQueryRetry(1, buildAxios401())).toBe(false);
  });

  it('非 401 的錯誤最多重試 2 次', () => {
    const error = new Error('network error');
    expect(defaultQueryRetry(1, error)).toBe(true);
    expect(defaultQueryRetry(2, error)).toBe(false);
  });
});
