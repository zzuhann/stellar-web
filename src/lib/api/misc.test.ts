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

  it('shows the Chinese backend reason with the field label', () => {
    expect(
      handleApiError(
        apiError({ error: '請輸入有效的網址', code: 'VALIDATION_ERROR', field: 'contactUrl' })
      )
    ).toBe('預約表單連結：請輸入有效的網址');
  });

  it('shows only the Chinese backend reason when the field has no label', () => {
    expect(handleApiError(apiError({ error: '請輸入有效的網址', code: 'VALIDATION_ERROR' }))).toBe(
      '請輸入有效的網址'
    );
    expect(
      handleApiError(
        apiError({ error: '請輸入有效的網址', code: 'VALIDATION_ERROR', field: 'unknownField' })
      )
    ).toBe('請輸入有效的網址');
  });

  it('does not prefix generic field keys shared across forms', () => {
    expect(
      handleApiError(
        apiError({
          error: '活動描述不能超過 2000 個字',
          code: 'VALIDATION_ERROR',
          field: 'description',
        })
      )
    ).toBe('活動描述不能超過 2000 個字');
  });

  it('falls back to the generic message when the reason is not Chinese', () => {
    expect(
      handleApiError(
        apiError({ error: 'Invalid url', code: 'VALIDATION_ERROR', field: 'contactUrl' })
      )
    ).toBe('預約表單連結格式不正確，請確認後再試');
    expect(handleApiError(apiError({ error: 'Invalid', code: 'VALIDATION_ERROR' }))).toBe(
      '輸入資料格式有誤，請確認後再試'
    );
  });

  it('uses the fallback for non-Axios errors', () => {
    expect(handleApiError(new Error('network failed'), '載入失敗')).toBe('載入失敗');
  });
});
