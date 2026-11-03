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

  it('裸 `url` key（xhr/fetch span 的 base attribute，Codex 第二輪 code review 補上）被遮蔽', () => {
    const event = baseEvent({
      type: 'transaction',
      spans: [
        {
          data: { url: '/venues?sort=distance&lat=25.033&lng=121.564' },
          span_id: 'span-1',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
      ],
    });

    const result = redactSentryEvent(event);
    const spanData = result.spans?.[0]?.data as Record<string, unknown>;

    expect(spanData.url).not.toContain('25.033');
    expect(spanData.url).toContain('lat=REDACTED');
    expect(spanData.url).toContain('sort=distance');
  });

  it('http.fragment 刻意不遮蔽（只會是 hash 片段，非 query-string 形狀，這個應用從未寫入座標）', () => {
    const event = baseEvent({
      type: 'transaction',
      spans: [
        {
          data: { 'http.fragment': '#section-1', 'http.url': 'https://x.com/a?lat=1&lng=2' },
          span_id: 'span-1',
          start_timestamp: 0,
          trace_id: 'trace-1',
        },
      ],
    });

    const result = redactSentryEvent(event);
    const spanData = result.spans?.[0]?.data as Record<string, unknown>;

    expect(spanData['http.fragment']).toBe('#section-1');
    expect(spanData['http.url']).not.toContain('lat=1');
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

// Ported from the backend's tests/unit/sentryRedaction.test.ts (same redaction logic).
// The SDK attaches incoming request bodies (up to 10KB), Authorization and cookies by
// default; a probe on @sentry/node 10.63.0 confirmed all three reach beforeSend.
describe('redactSentryEvent — request body／header 個資', () => {
  it('JSON 字串 body 只留欄位形狀（型別與長度），不留任何值', () => {
    const event = baseEvent({
      request: {
        data: JSON.stringify({
          email: 'user@example.com',
          message: 'hello world',
          artists: [{ id: 'a1' }, { id: 'a2' }],
          location: { address: '台北市大安區', coordinates: { lat: 25.03, lng: 121.56 } },
          count: 3,
          agreed: true,
          note: null,
        }),
      },
    });

    const result = redactSentryEvent(event);

    expect(result.request?.data).toEqual({
      email: 'string(16)',
      message: 'string(11)',
      artists: 'array(2)',
      location: { address: 'string(6)', coordinates: 'object(2)' },
      count: 'number',
      agreed: 'boolean',
      note: 'null',
    });
    expect(JSON.stringify(result.request)).not.toMatch(/user@example\.com|hello|台北|25\.03/);
  });

  it('已經是物件的 body 一樣只留形狀', () => {
    const event = baseEvent({ request: { data: { displayName: 'Zoe' } } });

    expect(redactSentryEvent(event).request?.data).toEqual({ displayName: 'string(3)' });
  });

  it('不是 JSON 的字串 body（例如 form 編碼）只留長度', () => {
    const event = baseEvent({ request: { data: 'email=user%40example.com&message=hi' } });

    const result = redactSentryEvent(event);

    expect(result.request?.data).toBe('[Filtered] string(35)');
  });

  it('Authorization、Cookie 等憑證 header 換成 [Filtered]（不分大小寫），其他 header 保留', () => {
    const event = baseEvent({
      request: {
        headers: {
          Authorization: 'Bearer SECRET_TOKEN',
          cookie: 'session=abc',
          'proxy-authorization': 'Basic xyz',
          'user-agent': 'Mozilla/5.0',
        },
        cookies: { session: 'abc' },
      },
    });

    const result = redactSentryEvent(event);

    expect(result.request?.headers).toEqual({
      Authorization: '[Filtered]',
      cookie: '[Filtered]',
      'proxy-authorization': '[Filtered]',
      'user-agent': 'Mozilla/5.0',
    });
    expect(result.request?.cookies).toBeUndefined();
    expect(JSON.stringify(result.request)).not.toMatch(/SECRET_TOKEN|session=abc|xyz/);
  });

  it('沒有 body／header 的 request 不受影響', () => {
    const event = baseEvent({
      request: { method: 'GET', url: 'https://api.stellar-zone.com/api/events' },
    });

    const result = redactSentryEvent(event);

    expect(result.request).toEqual({
      method: 'GET',
      url: 'https://api.stellar-zone.com/api/events',
    });
  });
});

describe('redactSentryEvent — 其他個資管道', () => {
  it('名稱含 session／token／key 等字樣的 header 也換成 [Filtered]（例如前端每個請求都帶的 x-session-id）', () => {
    const event = baseEvent({
      request: {
        headers: {
          'x-session-id': 'sess-123',
          'x-api-key': 'k-456',
          'X-CSRF-Token': 'c-789',
          'content-type': 'application/json',
        },
      },
    });

    const result = redactSentryEvent(event);

    expect(result.request?.headers).toEqual({
      'x-session-id': '[Filtered]',
      'x-api-key': '[Filtered]',
      'X-CSRF-Token': '[Filtered]',
      'content-type': 'application/json',
    });
  });

  it('console breadcrumb 的 message 與 arguments 裡的 email 換成 [email]', () => {
    const line = '[email] approval sent to someone@example.com for event abc';
    const event = baseEvent({
      breadcrumbs: [
        {
          category: 'console',
          message: line,
          data: { arguments: [line, { to: 'a.b+c@mail.co' }] },
        },
      ],
    });

    const result = redactSentryEvent(event);

    expect(result.breadcrumbs?.[0].message).toBe('[email] approval sent to [email] for event abc');
    expect(JSON.stringify(result.breadcrumbs)).not.toMatch(/someone@example\.com|a\.b\+c@mail\.co/);
  });

  it('trace／span data 的使用者 IP（http.client_ip、client.address）換成 [Filtered]', () => {
    const event = baseEvent({
      contexts: { trace: { trace_id: 't', span_id: 's', data: { 'http.client_ip': '1.2.3.4' } } },
      spans: [
        {
          span_id: 's2',
          trace_id: 't',
          start_timestamp: 0,
          data: { 'client.address': '5.6.7.8', 'http.method': 'GET' },
        },
      ],
    } as Partial<Event>);

    const result = redactSentryEvent(event);

    expect(result.contexts?.trace?.data?.['http.client_ip']).toBe('[Filtered]');
    expect(result.spans?.[0].data).toEqual({
      'client.address': '[Filtered]',
      'http.method': 'GET',
    });
  });

  it('body 的欄位名稱如果本身是 email，也換成 [email]', () => {
    const event = baseEvent({ request: { data: { 'user@example.com': { role: 'admin' } } } });

    expect(redactSentryEvent(event).request?.data).toEqual({ '[email]': { role: 'string(5)' } });
  });
});

describe('redactSentryEvent — Codex 第 1 輪', () => {
  it('很長且沒有 email 的字串不會讓 email 比對變慢（避免 ReDoS 卡住 event loop）', () => {
    const long = 'a'.repeat(40_000);
    const event = baseEvent({
      breadcrumbs: [{ message: long }, { message: `${'x.'.repeat(20_000)}@` }],
    });

    const started = Date.now();
    redactSentryEvent(event);

    expect(Date.now() - started).toBeLessThan(50);
  });

  it('email 在網址路徑中時只遮 email，保留前後路徑', () => {
    const event = baseEvent({ breadcrumbs: [{ message: 'GET /users/user@example.com/events' }] });

    expect(redactSentryEvent(event).breadcrumbs?.[0].message).toBe('GET /users/[email]/events');
  });

  it("email 前半段含單引號（例如 o'connor）時整個遮掉，不留姓名片段", () => {
    const event = baseEvent({ breadcrumbs: [{ message: "sent to o'connor@example.com" }] });

    expect(redactSentryEvent(event).breadcrumbs?.[0].message).toBe('sent to [email]');
  });

  it('span data 裡 SDK 複製的 cookie／set-cookie／敏感 header 屬性換成 [Filtered]', () => {
    const event = baseEvent({
      spans: [
        {
          span_id: 's',
          trace_id: 't',
          start_timestamp: 0,
          data: {
            'http.request.header.cookie.visitor': 'private-id',
            'http.request.header.x_session_id': 'sess-1',
            'http.response.header.set_cookie.sid': 'abc',
            'http.request.header.user_agent': 'Mozilla/5.0',
          },
        },
      ],
    } as Partial<Event>);

    expect(redactSentryEvent(event).spans?.[0].data).toEqual({
      'http.request.header.cookie.visitor': '[Filtered]',
      'http.request.header.x_session_id': '[Filtered]',
      'http.response.header.set_cookie.sid': '[Filtered]',
      'http.request.header.user_agent': 'Mozilla/5.0',
    });
  });
});

describe('redactSentryBreadcrumb — console 紀錄裡的 email', () => {
  it('message 與 data.arguments 裡的 email 換成 [email]，座標遮蔽照舊', () => {
    const breadcrumb: Breadcrumb = {
      category: 'console',
      message: 'login failed for user@example.com',
      data: { arguments: ['login failed for user@example.com'] },
    };

    const result = redactSentryBreadcrumb(breadcrumb);

    expect(result.message).toBe('login failed for [email]');
    expect(JSON.stringify(result)).not.toContain('user@example.com');
  });
});

describe('redactSentryEvent — 前端 code review 回饋（兩邊共用的邏輯）', () => {
  it('breadcrumb 裡的 Error、Date 等非一般物件原樣保留，不被弄成空物件', () => {
    const error = new Error('Network timeout');
    const when = new Date(0);
    const event = baseEvent({
      breadcrumbs: [{ category: 'console', data: { arguments: [error, when] } }],
    });

    const args = redactSentryEvent(event).breadcrumbs?.[0].data?.arguments as unknown[];

    expect(args[0]).toBe(error);
    expect(args[1]).toBe(when);
  });

  it('巢狀到第 4 層的 email 也會遮（例如 console.log({ user: { email } })）', () => {
    const event = baseEvent({
      breadcrumbs: [
        { data: { arguments: [{ user: { profile: { email: 'deep@example.com' } } }] } },
      ],
    });

    expect(JSON.stringify(redactSentryEvent(event).breadcrumbs)).not.toContain('deep@example.com');
  });

  it('地理位置／IP 類 header 與平台簽章 header 換成 [Filtered]', () => {
    const event = baseEvent({
      request: {
        headers: {
          'x-vercel-ip-latitude': '25.03',
          'x-vercel-ip-longitude': '121.56',
          'x-vercel-ip-city': 'Taipei',
          'x-vercel-ip-postal-code': '106',
          'x-client-geo-location': 'TW',
          'cf-connecting-ip': '1.2.3.4',
          'x-vercel-proxy-signature': 'sig',
          'x-amzn-oidc-identity': 'id',
          accept: 'application/json',
        },
      },
    });

    const headers = redactSentryEvent(event).request?.headers ?? {};

    expect(headers.accept).toBe('application/json');
    for (const [key, value] of Object.entries(headers)) {
      if (key !== 'accept') expect(value).toBe('[Filtered]');
    }
  });

  it('span data 的 net.peer.ip 換成 [Filtered]', () => {
    const event = baseEvent({
      contexts: { trace: { trace_id: 't', span_id: 's', data: { 'net.peer.ip': '1.2.3.4' } } },
    });

    expect(redactSentryEvent(event).contexts?.trace?.data?.['net.peer.ip']).toBe('[Filtered]');
  });

  it('錯誤訊息（exception value、message）裡的 email 換成 [email]', () => {
    const event = baseEvent({
      message: 'lookup failed for a@example.com',
      exception: { values: [{ type: 'Error', value: 'No account for user@example.com' }] },
    });

    const result = redactSentryEvent(event);

    expect(result.message).toBe('lookup failed for [email]');
    expect(result.exception?.values?.[0].value).toBe('No account for [email]');
  });
});

describe('redactSentryBreadcrumb — 伺服器端對外請求的 query', () => {
  it('Node 對外請求 breadcrumb 的 data[http.query] 座標被遮蔽', () => {
    const breadcrumb: Breadcrumb = {
      category: 'http',
      data: {
        url: 'https://api.stellar-zone.com/api/venues',
        'http.query': '?sort=distance&lat=25.03&lng=121.56',
      },
    };

    const query = redactSentryBreadcrumb(breadcrumb).data?.['http.query'] as string;

    expect(query).not.toContain('25.03');
    expect(query).not.toContain('121.56');
    expect(query).toContain('sort=distance');
  });
});

describe('redactSentryEvent — 前端 Codex 第 1 輪（兩邊共用）', () => {
  it('x-forwarded-for、x-vercel-forwarded-for、Forwarded 帶的使用者 IP 換成 [Filtered]；x-forwarded-proto 保留', () => {
    const event = baseEvent({
      request: {
        headers: {
          'x-forwarded-for': '203.0.113.7, 10.0.0.1',
          'x-vercel-forwarded-for': '203.0.113.7',
          Forwarded: 'for=203.0.113.7;proto=https',
          'x-forwarded-proto': 'https',
        },
      },
    });

    expect(redactSentryEvent(event).request?.headers).toEqual({
      'x-forwarded-for': '[Filtered]',
      'x-vercel-forwarded-for': '[Filtered]',
      Forwarded: '[Filtered]',
      'x-forwarded-proto': 'https',
    });
  });

  it('span 上 SDK 把 - 換成 _ 的 header 屬性（x_vercel_ip_city、cf_connecting_ip、x_forwarded_for）也換成 [Filtered]', () => {
    const event = baseEvent({
      spans: [
        {
          span_id: 's',
          trace_id: 't',
          start_timestamp: 0,
          data: {
            'http.request.header.x_vercel_ip_city': 'Taipei',
            'http.request.header.cf_connecting_ip': '1.2.3.4',
            'http.request.header.x_forwarded_for': '1.2.3.4',
            'http.request.header.accept_language': 'zh-TW',
          },
        },
      ],
    } as Partial<Event>);

    expect(redactSentryEvent(event).spans?.[0].data).toEqual({
      'http.request.header.x_vercel_ip_city': '[Filtered]',
      'http.request.header.cf_connecting_ip': '[Filtered]',
      'http.request.header.x_forwarded_for': '[Filtered]',
      'http.request.header.accept_language': 'zh-TW',
    });
  });
});
