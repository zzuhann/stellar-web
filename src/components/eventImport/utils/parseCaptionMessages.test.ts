import { describe, it, expect } from 'vitest';
import {
  isParsedEmpty,
  resolveParseCaptionError,
  PARSE_NO_CONTENT_MESSAGE,
  PARSE_SYSTEM_ERROR_MESSAGE,
} from './parseCaptionMessages';
import { ParsedCaptionData } from '@/types';

const emptyParsed: ParsedCaptionData = {
  title: null,
  artistName: null,
  eventDateStart: null,
  eventDateEnd: null,
  timeStart: null,
  timeEnd: null,
  location: null,
  socialMedia: null,
  redemptionCondition: null,
};

describe('isParsedEmpty', () => {
  it('所有欄位皆為 null 時回傳 true', () => {
    expect(isParsedEmpty(emptyParsed)).toBe(true);
  });

  it('只要有一個欄位有值就回傳 false', () => {
    expect(isParsedEmpty({ ...emptyParsed, title: '活動標題' })).toBe(false);
  });

  it('只有 artistName 有值（不對應任何表單欄位）仍算有內容', () => {
    expect(isParsedEmpty({ ...emptyParsed, artistName: 'RICKY' })).toBe(false);
  });
});

describe('resolveParseCaptionError', () => {
  it('呼叫本身失敗（網路層/非 200）→ 系統性錯誤訊息', () => {
    expect(resolveParseCaptionError(undefined, new Error('network error'))).toBe(
      PARSE_SYSTEM_ERROR_MESSAGE
    );
  });

  it('success:false 時（不論 reason）→ 系統性錯誤訊息', () => {
    expect(resolveParseCaptionError({ success: false, reason: 'quota_exceeded' }, undefined)).toBe(
      PARSE_SYSTEM_ERROR_MESSAGE
    );
  });

  it('success:false 且有 message 時優先使用該 message', () => {
    expect(
      resolveParseCaptionError(
        { success: false, reason: 'parse_failed', message: '自訂錯誤訊息' },
        undefined
      )
    ).toBe('自訂錯誤訊息');
  });

  it('success:false 沒有 message 但有 error 時（例如 400 驗證錯誤）改用 error', () => {
    expect(resolveParseCaptionError({ success: false, error: '文案內容過長' }, undefined)).toBe(
      '文案內容過長'
    );
  });

  it('success:true 但所有欄位皆為 null → 無法判斷內容訊息', () => {
    expect(resolveParseCaptionError({ success: true, parsed: emptyParsed }, undefined)).toBe(
      PARSE_NO_CONTENT_MESSAGE
    );
  });

  it('success:true 且有欄位有值 → 不顯示常駐錯誤', () => {
    expect(
      resolveParseCaptionError(
        { success: true, parsed: { ...emptyParsed, title: '活動標題' } },
        undefined
      )
    ).toBeNull();
  });

  it('尚未有回應也沒有錯誤時 → 不顯示', () => {
    expect(resolveParseCaptionError(undefined, undefined)).toBeNull();
  });
});
