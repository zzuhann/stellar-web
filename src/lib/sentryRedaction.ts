// Shared Sentry redaction for the browser (src/instrumentation-client.ts) and the Next.js
// server and edge runtimes (sentry.server.config.ts, sentry.edge.config.ts), wired into
// beforeBreadcrumb/beforeSend/beforeSendTransaction. It removes coordinates (venue distance
// sort sends lat/lng in request URLs; key matching shared with src/lib/privacyRedaction.ts),
// request bodies, credential/IP/location headers, emails and client IPs. Kept in sync with
// the backend's stellar/src/utils/sentryRedaction.ts.
import type { Breadcrumb, Event } from '@sentry/nextjs';
import { redactCoordsFromQueryString, redactCoordsFromUrl } from './privacyRedaction';

function redactRequestEventData(request: Event['request']): void {
  if (!request) return;

  if (typeof request.url === 'string') {
    request.url = redactCoordsFromUrl(request.url);
  }
  if (typeof request.query_string === 'string') {
    request.query_string = redactCoordsFromQueryString(request.query_string);
  }
}

// span/trace data 裡可能帶座標的欄位名稱。Codex 第二輪 code review 指出原清單漏了
// 裸 `url` 這個 key，已對已安裝的 @sentry/browser（10.62.0）/@sentry/core 原始碼重新
// 逐一核對所有會把 outgoing request URL 寫進 span attributes 的路徑：
// - node_modules/@sentry/core/build/cjs/fetch.js:189-209（getFetchSpanAttributes，
//   fetch span 的 base attributes）：設定裸 `url`（原始、可能是相對路徑的 URL 字串，
//   行 191）、`http.url`（完整 URL，行 199）、`http.query`（純 query string，行 203）、
//   `http.fragment`（hash，行 206）。
// - node_modules/@sentry/browser/build/npm/cjs/prod/tracing/request.js:35-44
//   （instrumentOutgoingRequests 的 fetch 分支）：在上面的 base attributes 之上再疊
//   一次 `http.url`/`url.full`，兩者保證同值。
// - 同檔案 170-181 行（xhrCallback，xhr span attributes）：同樣設定裸 `url`（行
//   170）、`http.url`/`url.full`（行 173/176）、`http.query`（行 180）、`http.fragment`
//   （行 181）。
// - node_modules/@sentry/browser/build/npm/cjs/prod/integrations/httpcontext.js：
//   會把 `url.full` 寫進頁面自己的 root span（processSegmentSpan），但來源是
//   `window.location.href`（頁面本身網址），座標從未寫進瀏覽器網址列，不會帶座標；
//   仍一併遮蔽，不依賴這個隱含前提。
// - node_modules/@sentry/browser-utils/build/cjs/metrics/resourceTiming.js：resource
//   timing span 只有時間戳數值屬性，沒有任何 URL 類欄位，確認不需要處理。
//
// `http.fragment` 不納入遮蔽清單：它只會是 URL 的 hash 片段本身（不含 `?`、非
// query-string 形狀），這個應用從未把任何資料寫進 URL fragment，也沒有其他座標
// 來源會流進這個欄位；用 redactCoordsFromQueryString 處理非 query-string 格式的字串
// 語意上不對，故刻意排除。
// `http.target` 是伺服端慣例，瀏覽器 span 不會設定，這裡仍一併處理（欄位不存在時
// 原樣跳過，不報錯）——與後端 stellar/src/utils/sentryRedaction.ts 的欄位清單保持
// 一致，方便兩邊比對。
const URL_LIKE_DATA_KEYS = ['url', 'url.full', 'http.url', 'http.target'] as const;
const QUERY_STRING_DATA_KEYS = ['url.query', 'http.query'] as const;

function redactUrlLikeDataFields(data: Record<string, unknown> | undefined): void {
  if (!data) return;

  for (const key of URL_LIKE_DATA_KEYS) {
    const value = data[key];
    if (typeof value === 'string') {
      data[key] = redactCoordsFromUrl(value);
    }
  }

  for (const key of QUERY_STRING_DATA_KEYS) {
    const value = data[key];
    if (typeof value === 'string') {
      data[key] = redactCoordsFromQueryString(value);
    }
  }
}

// Bounded quantifiers keep matching linear (an unbounded pattern was quadratic on long
// '@'-free strings), and excluding '/' keeps URL paths around an email intact.
const EMAIL_PATTERN = /[A-Za-z0-9._%+'-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){1,8}/g;

function redactEmails(text: string): string {
  return text.includes('@') ? text.replace(EMAIL_PATTERN, '[email]') : text;
}

// Request bodies (email, messages, submissions) are personal data; keep only their shape
// (field names, types, lengths) so input-dependent bugs stay debuggable without storing values.
const MAX_SHAPE_DEPTH = 2;

function shapeOf(value: unknown, depth: number): unknown {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array(${value.length})`;
  if (typeof value === 'string') return `string(${value.length})`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (depth >= MAX_SHAPE_DEPTH) return `object(${entries.length})`;
    return Object.fromEntries(
      entries.map(([key, child]) => [redactEmails(key), shapeOf(child, depth + 1)])
    );
  }
  return typeof value;
}

function redactRequestBody(request: NonNullable<Event['request']>): void {
  const { data } = request;
  if (data === undefined) return;
  if (typeof data === 'string') {
    try {
      request.data = shapeOf(JSON.parse(data), 0);
    } catch {
      request.data = `[Filtered] string(${data.length})`;
    }
    return;
  }
  request.data = shapeOf(data, 0);
}

// Same idea as the SDK's own span-header filter: any header named like a credential or session.
const SENSITIVE_HEADER_SNIPPETS = [
  // credentials and sessions (aligned with the SDK's sensitive-key list)
  'auth',
  'token',
  'session',
  'cookie',
  'key',
  'secret',
  'password',
  'csrf',
  'xsrf',
  'jwt',
  'bearer',
  'signature',
  'credential',
  'identity',
  'sso',
  'sid',
  // client IP and location (Vercel adds x-vercel-ip-latitude/longitude/city/postal-code)
  '-ip',
  'forwarded-for',
  'geo',
  'latitude',
  'longitude',
  'latlong',
  'postal',
];

// Span attributes spell header names with '_' instead of '-', so normalize before matching.
function isSensitiveHeaderName(name: string): boolean {
  const normalized = name.toLowerCase().replace(/_/g, '-');
  return (
    normalized === 'forwarded' ||
    SENSITIVE_HEADER_SNIPPETS.some((snippet) => normalized.includes(snippet))
  );
}

function redactCredentials(request: NonNullable<Event['request']>): void {
  delete request.cookies;
  if (!request.headers) return;
  for (const key of Object.keys(request.headers)) {
    if (isSensitiveHeaderName(key)) request.headers[key] = '[Filtered]';
  }
}

const MAX_EMAIL_SCAN_DEPTH = 5;

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
}

// Rebuilds only arrays and plain objects; Error, Date and class instances pass through
// untouched so the SDK can still serialize their message and stack.
function redactEmailsDeep(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') return redactEmails(value);
  if (depth >= MAX_EMAIL_SCAN_DEPTH || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redactEmailsDeep(item, depth + 1));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      redactEmailsDeep(v, depth + 1),
    ])
  );
}

// Console breadcrumbs carry whatever was logged, e.g. emailService logging recipients.
function redactBreadcrumbs(breadcrumbs: Event['breadcrumbs']): void {
  breadcrumbs?.forEach((crumb) => {
    if (typeof crumb.message === 'string') crumb.message = redactEmails(crumb.message);
    if (crumb.data) crumb.data = redactEmailsDeep(crumb.data) as typeof crumb.data;
  });
}

// The server span records the caller's IP even with sendDefaultPii off, and copies request
// and response headers (including individual cookies) into http.*.header.* attributes.
const CLIENT_IP_DATA_KEYS = [
  'http.client_ip',
  'client.address',
  'net.peer.ip',
  'net.sock.peer.addr',
] as const;
const HEADER_ATTRIBUTE_PREFIX = /^http\.(?:request|response)\.header\./;

function redactSpanData(data: Record<string, unknown> | undefined): void {
  if (!data) return;
  for (const key of CLIENT_IP_DATA_KEYS) {
    if (key in data) data[key] = '[Filtered]';
  }
  for (const key of Object.keys(data)) {
    const header = key.replace(HEADER_ATTRIBUTE_PREFIX, '');
    if (header !== key && isSensitiveHeaderName(header)) data[key] = '[Filtered]';
  }
}

/**
 * Shared by Sentry beforeSend/beforeSendTransaction (browser, server and edge): redacts
 * coordinates, request bodies, credential headers, emails in breadcrumbs, and client IPs and
 * header copies on spans, in place. Always returns the event so it is still reported.
 */
export function redactSentryEvent<T extends Event>(event: T): T {
  redactRequestEventData(event.request);
  if (event.request) {
    redactRequestBody(event.request);
    redactCredentials(event.request);
  }
  redactBreadcrumbs(event.breadcrumbs);
  if (typeof event.message === 'string') event.message = redactEmails(event.message);
  event.exception?.values?.forEach((exception) => {
    if (typeof exception.value === 'string') exception.value = redactEmails(exception.value);
  });
  const traceData = event.contexts?.trace?.data as Record<string, unknown> | undefined;
  redactUrlLikeDataFields(traceData);
  redactSpanData(traceData);
  event.spans?.forEach((span) => {
    const spanData = span.data as Record<string, unknown> | undefined;
    redactUrlLikeDataFields(spanData);
    redactSpanData(spanData);
  });
  return event;
}

// xhr/fetch breadcrumb 的 URL 放在 `data.url`（node_modules/@sentry/browser/build/npm/
// cjs/prod/integrations/breadcrumbs.js：_getXhrBreadcrumbHandler/_getFetchBreadcrumbHandler
// 皆設 `data = { method, url, status_code }`）；history（SPA 導覽）breadcrumb 則是
// `data.from`/`data.to`——這兩個欄位理論上只會是站內相對路徑（座標從未寫進瀏覽器網址
// 列），但一併遮蔽同一組 key 判定，不依賴這個隱含前提，與 VenueCard 的 isInAppBrowser
// 防呆同一個原則。
const BREADCRUMB_URL_KEYS = ['url', 'from', 'to'] as const;

/**
 * For beforeBreadcrumb: redacts coordinates in URL-ish breadcrumb data and emails in the
 * message and data, in place. Always returns the breadcrumb so it is still recorded.
 */
export function redactSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const data = breadcrumb.data as Record<string, unknown> | undefined;
  if (data) {
    for (const key of BREADCRUMB_URL_KEYS) {
      const value = data[key];
      if (typeof value === 'string') {
        data[key] = redactCoordsFromUrl(value);
      }
    }
  }
  // Node outgoing fetch/http breadcrumbs (server/edge) keep data.url query-free and put the
  // query string in data['http.query'] instead.
  if (data && typeof data['http.query'] === 'string') {
    data['http.query'] = redactCoordsFromQueryString(data['http.query']);
  }
  redactBreadcrumbs([breadcrumb]);
  return breadcrumb;
}
