// Sentry beforeBreadcrumb/beforeSend/beforeSendTransaction 共用的座標遮蔽邏輯，
// 接在 src/instrumentation-client.ts 的 Sentry.init 上。遮蔽對象與
// src/lib/privacyRedaction.ts 共用同一套 lat/lng key 判定。
//
// 背景（Codex 第一輪 code review P1）：venueApi.getVenues（src/lib/api/venues.ts）在
// sort=distance 時送出的請求 URL 帶 lat/lng。瀏覽器端 Sentry SDK 的 xhr/fetch
// breadcrumb 自動記錄完整請求 URL（breadcrumb.data.url），browserTracingIntegration
// 的 outgoing request span 也會把同一個 URL 存進 span 的 http.url/url.full/http.query
// 屬性——這兩條路徑都不受後端 stellar/src/utils/privacyRedaction.ts 的 Cloud Run log
// 遮蔽保護，是獨立的外流管道。
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

/**
 * Sentry beforeSend/beforeSendTransaction 共用：遮蔽 event 裡任何可能帶座標的欄位，
 * mutate in place 後回傳同一個 event（永遠不回傳 null）——錯誤或效能事件仍要回報，
 * 只是拿掉座標，不是整筆事件都丟掉。
 */
export function redactSentryEvent<T extends Event>(event: T): T {
  redactRequestEventData(event.request);
  redactUrlLikeDataFields(event.contexts?.trace?.data as Record<string, unknown> | undefined);
  event.spans?.forEach((span) =>
    redactUrlLikeDataFields(span.data as Record<string, unknown> | undefined)
  );
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
 * Sentry beforeBreadcrumb 專用：遮蔽 breadcrumb.data 裡任何可能帶座標的 URL 欄位，
 * mutate in place 後回傳同一個 breadcrumb（永遠不回傳 null，breadcrumb 仍要記錄，
 * 只是拿掉座標）。沒有 `data` 或 `data` 不含任何目標 key 時原樣跳過。
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
  return breadcrumb;
}
