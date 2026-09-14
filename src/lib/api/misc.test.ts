import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { handleApiError } from './misc';

vi.mock('./client', () => ({ default: {} }));

const apiError = (data: unknown, status = 400) =>
  new AxiosError('request failed', undefined, undefined, undefined, {
    status,
    statusText: 'Error',
    headers: {},
    config: {} as never,
    data,
  });

describe('handleApiError', () => {
  it('uses the stable code mapping for the new response format', () => {
    expect(handleApiError(apiError({ error: 'Permission denied', code: 'FORBIDDEN' }))).toBe(
      '權限不足'
    );
  });

  it('keeps supporting the legacy error-only response', () => {
    expect(handleApiError(apiError({ error: '舊版錯誤訊息' }))).toBe('舊版錯誤訊息');
  });

  it('maps validation fields to a user-facing message', () => {
    expect(
      handleApiError(
        apiError({ error: 'Stage name is required', code: 'VALIDATION_ERROR', field: 'stageName' })
      )
    ).toBe('藝名格式不正確，請確認後再試');
  });

  it('uses the fallback for non-Axios errors', () => {
    expect(handleApiError(new Error('network failed'), '載入失敗')).toBe('載入失敗');
  });
});
