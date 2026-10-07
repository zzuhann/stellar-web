import type { Breadcrumb, Event } from '@sentry/nextjs';
import { describe, expect, it } from 'vitest';
import { redactSentryBreadcrumb, redactSentryEvent } from './sentryRedaction';

// 對應 Codex 第一輪 code review P1：venueApi.getVenues 送出的 lat/lng 會被瀏覽器端
// Sentry SDK 的 xhr/fetch breadcrumb 與 tracing span 原封不動帶走。測試直接針對共用
// 的 pure function，不透過 Sentry.init 實際發送事件（instrumentation-client.ts 只負責
// 接到 beforeBreadcrumb/beforeSend/beforeSendTransaction，接線本身比照後端
// instrument.ts 的慣例不另外測試）。

const baseEvent = (overrides: Partial<Event> = {}): Event => ({
  event_id: 'evt-1',
  timestamp: 0,
  ...overrides,
});

describe('redactSentryEvent — event.request', () => {
  it('遮蔽 request.url 中的 lat/lng，其餘參數維持原樣', () => {
    const event = baseEvent({
      request: {
        url: 'https://api.stellar-zone.com/venues?sort=distance&lat=25.033&lng=121.564',
      },
    });

    const result = redactSentryEvent(event);

    expect(result.request?.url).toContain('lat=REDACTED');
    expect(result.request?.url).toContain('lng=REDACTED');
    expect(result.request?.url).not.toContain('25.033');
    expect(result.request?.url).toContain('sort=distance');
  });

  it('query_string 為 string 形狀時正確遮蔽', () => {
    const event = baseEvent({
      request: {
        url: 'https://api.stellar-zone.com/venues',
        query_string: '?lat=25.033&lng=121.564',
      },
    });

    const result = redactSentryEvent(event);

    expect(result.request?.query_string).toBe('?lat=REDACTED&lng=REDACTED');
  });

  it('沒有 request 欄位的 event（如部分 error event）不丟例外，照常回傳', () => {
    const event = baseEvent();

    expect(() => redactSentryEvent(event)).not.toThrow();
    const result = redactSentryEvent(event);
    expect(result.request).toBeUndefined();
  });

  it('request 存在但沒有 query_string／url 時不受影響', () => {
    const event = baseEvent({ request: { method: 'GET' } });

    const result = redactSentryEvent(event);

    expect(result.request).toEqual({ method: 'GET' });
  });
});

describe('redactSentryEvent — transaction spans', () => {
  it('span.data 的 http.url／http.target 被遮蔽，其餘 data 維持原樣', () => {
    const event = baseEvent({
      type: 'transaction',
      spans: [
        {
          data: {
            'http.url': 'https://api.stellar-zone.com/venues?lat=25.033&lng=121.564',
            'http.target': '/venues?lat=25.033&lng=121.564',
            'http.method': 'GET',
          },
          span_id: 'span-1',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
      ],
    });

    const result = redactSentryEvent(event);
    const spanData = result.spans?.[0]?.data as Record<string, unknown>;

    expect(spanData['http.url']).not.toContain('25.033');
    expect(spanData['http.target']).not.toContain('121.564');
    expect(spanData['http.method']).toBe('GET');
  });

  it('span.data 的 http.query／url.query（純 query string）被遮蔽', () => {
    const event = baseEvent({
      type: 'transaction',
      spans: [
        {
          data: {
            'http.query': '?lat=25.033&lng=121.564',
            'url.query': 'lat=25.033&lng=121.564',
          },
          span_id: 'span-1',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
      ],
    });

    const result = redactSentryEvent(event);
    const spanData = result.spans?.[0]?.data as Record<string, unknown>;

    expect(spanData['http.query']).not.toContain('25.033');
    expect(spanData['url.query']).not.toContain('121.564');
  });

  it('url.full 被遮蔽', () => {
    const event = baseEvent({
      type: 'transaction',
      spans: [
        {
          data: { 'url.full': 'https://api.stellar-zone.com/venues?lat=25.033&lng=121.564' },
          span_id: 'span-1',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
      ],
    });

    const result = redactSentryEvent(event);
    const spanData = result.spans?.[0]?.data as Record<string, unknown>;

    expect(spanData['url.full']).not.toContain('25.033');
  });

  it('沒有 spans 的 event（如一般 error event）不丟例外', () => {
    const event = baseEvent();
    expect(() => redactSentryEvent(event)).not.toThrow();
  });

  it('多個 span 時每個都各自被處理，不互相影響', () => {
    const event = baseEvent({
      type: 'transaction',
      spans: [
        {
          data: { 'http.url': 'https://x.com/a?lat=1&lng=2' },
          span_id: 'span-1',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
        {
          data: { 'http.url': `https://x.com/b?region=${encodeURIComponent('台北')}` },
          span_id: 'span-2',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
      ],
    });

    const result = redactSentryEvent(event);

    expect((result.spans?.[0]?.data as Record<string, unknown>)['http.url']).toContain('REDACTED');
    expect((result.spans?.[1]?.data as Record<string, unknown>)['http.url']).toBe(
      `https://x.com/b?region=${encodeURIComponent('台北')}`
    );
  });
});

describe('redactSentryEvent — contexts.trace.data', () => {
  it('contexts.trace.data 裡的 URL/query 欄位被遮蔽', () => {
    const event = baseEvent({
      type: 'transaction',
      contexts: {
        trace: {
          span_id: 'span-1',
          trace_id: 'trace-1',
          data: {
            'http.url': 'https://api.stellar-zone.com/venues?lat=25.033&lng=121.564',
          },
        },
      },
    });

    const result = redactSentryEvent(event);

    expect(
      (result.contexts?.trace?.data as Record<string, unknown> | undefined)?.['http.url']
    ).not.toContain('25.033');
  });

  it('沒有 contexts 或 contexts.trace 的 event 不丟例外', () => {
    expect(() => redactSentryEvent(baseEvent())).not.toThrow();
    expect(() => redactSentryEvent(baseEvent({ contexts: {} }))).not.toThrow();
  });
});

describe('redactSentryEvent — 永遠回傳 event，不丟事件', () => {
  it('遮蔽後回傳同一個 event 參考（mutate in place），而不是 null', () => {
    const event = baseEvent({ request: { url: '/venues?lat=25.033&lng=121.564' } });

    const result = redactSentryEvent(event);

    expect(result).toBe(event);
    expect(result).not.toBeNull();
  });

  it('不含任何座標的一般 event 原樣回傳（不報錯、不遺失欄位）', () => {
    const event = baseEvent({
      message: 'Something went wrong',
      request: { url: '/venues', method: 'GET' },
    });

    const result = redactSentryEvent(event);

    expect(result.message).toBe('Something went wrong');
    expect(result.request).toEqual({ url: '/venues', method: 'GET' });
  });
});

// ─── breadcrumb（瀏覽器端 xhr/fetch/history 專用，後端沒有這個情境）────────────

const baseBreadcrumb = (overrides: Partial<Breadcrumb> = {}): Breadcrumb => ({
  timestamp: 0,
  ...overrides,
});

describe('redactSentryBreadcrumb — xhr/fetch breadcrumb', () => {
  it('遮蔽 category=xhr 的 data.url，其餘欄位維持原樣', () => {
    const breadcrumb = baseBreadcrumb({
      category: 'xhr',
      type: 'http',
      data: {
        method: 'GET',
        url: 'https://api.stellar-zone.com/venues?sort=distance&lat=25.033&lng=121.564',
        status_code: 200,
      },
    });

    const result = redactSentryBreadcrumb(breadcrumb);
    const data = result.data as Record<string, unknown>;

    expect(data.url).not.toContain('25.033');
    expect(data.url).toContain('lat=REDACTED');
    expect(data.method).toBe('GET');
    expect(data.status_code).toBe(200);
  });

  it('遮蔽 category=fetch 的 data.url', () => {
    const breadcrumb = baseBreadcrumb({
      category: 'fetch',
      type: 'http',
      data: {
        method: 'GET',
        url: 'https://api.stellar-zone.com/venues?lat=25.033&lng=121.564',
        status_code: 200,
      },
    });

    const result = redactSentryBreadcrumb(breadcrumb);

    expect((result.data as Record<string, unknown>).url).not.toContain('121.564');
  });

  it('不含座標的 breadcrumb 原樣通過', () => {
    // 非 ASCII 值經過 URL/URLSearchParams round-trip 後會被 percent-encode，用已編碼
    // 的輸入才能驗證「值本身不變」而不是巧合躲過編碼差異（比照 privacyRedaction.test.ts
    // 既有慣例）。
    const url = `https://api.stellar-zone.com/venues?region=${encodeURIComponent('台北')}`;
    const breadcrumb = baseBreadcrumb({
      category: 'xhr',
      data: { method: 'GET', url },
    });

    const result = redactSentryBreadcrumb(breadcrumb);

    expect((result.data as Record<string, unknown>).url).toBe(url);
  });

  it('沒有 data 的 breadcrumb（如部分 console breadcrumb）不丟例外，原樣通過', () => {
    const breadcrumb = baseBreadcrumb({ category: 'console', message: 'log message' });

    expect(() => redactSentryBreadcrumb(breadcrumb)).not.toThrow();
    const result = redactSentryBreadcrumb(breadcrumb);
    expect(result.message).toBe('log message');
    expect(result.data).toBeUndefined();
  });

  it('遮蔽後回傳同一個 breadcrumb 參考（mutate in place），而不是 null', () => {
    const breadcrumb = baseBreadcrumb({
      category: 'xhr',
      data: { url: '/venues?lat=25.033&lng=121.564' },
    });

    const result = redactSentryBreadcrumb(breadcrumb);

    expect(result).toBe(breadcrumb);
    expect(result).not.toBeNull();
  });
});

describe('redactSentryBreadcrumb — history（SPA 導覽）breadcrumb', () => {
  it('遮蔽 data.from／data.to（防呆，正常流程下這兩個欄位本就不含座標）', () => {
    const breadcrumb = baseBreadcrumb({
      category: 'navigation',
      data: { from: '/venues?lat=25.033&lng=121.564', to: '/venues?sort=distance' },
    });

    const result = redactSentryBreadcrumb(breadcrumb);
    const data = result.data as Record<string, unknown>;

    expect(data.from).not.toContain('25.033');
    expect(data.to).toBe('/venues?sort=distance');
  });
});
