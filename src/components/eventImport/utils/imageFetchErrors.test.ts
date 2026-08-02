import { describe, it, expect } from 'vitest';
import { resolveFetchImageErrorMessage } from './imageFetchErrors';

describe('resolveFetchImageErrorMessage', () => {
  it.each([
    ['fetch_failed', '網址已失效，請確認來源是否還存在'],
    ['blocked_host', '網址已失效，請確認來源是否還存在'],
    ['invalid_content_type', '這個網址不是圖片，請確認貼的是圖片直連'],
    ['unsupported_format', '圖片格式不支援'],
    ['size_out_of_range', '圖片格式不支援'],
  ] as const)('reason=%s → %s', (reason, expected) => {
    expect(resolveFetchImageErrorMessage({ success: false, error: 'x', reason }, undefined)).toBe(
      expected
    );
  });

  it('沒有 reason 時使用後端 error 文字', () => {
    expect(resolveFetchImageErrorMessage({ success: false, error: '自訂錯誤' }, undefined)).toBe(
      '自訂錯誤'
    );
  });

  it('呼叫本身失敗（網路層錯誤）時使用通用文案', () => {
    expect(resolveFetchImageErrorMessage(undefined, new Error('network'))).toBe(
      '圖片抓取失敗，請重試'
    );
  });
});
