// 座標類 query 參數（目前為場地距離最近排序 sort=distance 的 lat/lng）不應流出到任何
// 第三方/平台記錄（目前是前端 Sentry event/breadcrumb）——即使已經在送出前就把座標四捨
// 五入到小數第 3 位（約 100 公尺精度），仍是可追蹤到大致位置的個資。
//
// 僅用於 src/lib/sentryRedaction.ts。前端自己維護一份，不與 stellar（後端）的
// src/utils/privacyRedaction.ts 跨 repo 共用——兩邊是獨立 runtime，邏輯刻意保持一致但
// 各自維護；若未來新增其他座標/個資類 query 參數，兩邊都要各自在 COORD_QUERY_KEYS 補上。
//
// Codex 第三輪 code review 修正：原本借助 URLSearchParams 做 key 比對，但
// URLSearchParams／`new URL()` 對畸形 percent-encoding 的 query key 有容錯行為——例如
// `la%74%=25.033` 會被 lenient 解碼成 key "lat%"（trailing 的單獨 `%` 不會讓它拋例外，
// 只是被當成字面字元留著），導致 `isCoordKey('lat%')` 判定為 false，座標值就這樣繞過
// 遮蔽流出去。改為自己手動切 query（`&` 分段、每段用第一個 `=` 切 key/value），對每個
// key 用嚴格的 `decodeURIComponent`（先把 `+` 轉空白，比照 application/x-www-form-
// urlencoded 慣例）解碼；只要有任何一個 key 解碼失敗（如上述畸形序列），整段 query
// 直接 fail closed 捨棄，不嘗試「挑出看起來正常的那些 key 繼續處理」。value 本身不解碼、
// 不驗證——只要 key 判定不是座標，該 pair 原樣輸出，不動它的任何編碼細節。

const COORD_QUERY_KEYS = new Set(['lat', 'lng']);

const isCoordKey = (key: string): boolean => COORD_QUERY_KEYS.has(key.toLowerCase());

/** 嚴格解碼單個 query key；解碼失敗（畸形 percent-encoding）回傳 null。 */
function decodeQueryKey(rawKey: string): string | null {
  try {
    return decodeURIComponent(rawKey.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

/**
 * 遮蔽一段「不含開頭 ?」的原始 query string。回傳 `null` 代表任一 key 解碼失敗，呼叫端
 * 必須 fail closed（整段捨棄，只留 path／回傳空字串）；回傳 `''` 單純代表輸入本來就是
 * 空字串，兩者意義不同，呼叫端需要分開判斷。
 */
function redactRawQuery(rawQuery: string): string | null {
  if (rawQuery === '') return '';

  const pairs = rawQuery.split('&');
  const outputPairs: string[] = [];

  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    const rawKey = eqIndex === -1 ? pair : pair.slice(0, eqIndex);
    const decodedKey = decodeQueryKey(rawKey);
    if (decodedKey === null) return null;

    outputPairs.push(isCoordKey(decodedKey) ? `${decodedKey}=REDACTED` : pair);
  }

  return outputPairs.join('&');
}

// 給相對路徑（如 history breadcrumb 的 from/to，同源時只會是 path+query）用的佔位 base，
// 只是讓 new URL() 能夠解析——不代表任何真實網域。
const RELATIVE_URL_BASE = 'http://internal';

/**
 * 遮蔽完整 URL（含 scheme/host，如 Sentry 的 breadcrumb.data.url、http.url/url.full）
 * 或純 path+query 字串中的座標 query 參數，其餘參數維持原樣（含其原始編碼，逐字不變）。
 *
 * 輸入本身是絕對 URL 時保留原 origin；輸入是相對路徑時輸出也只有 path+query（不無端
 * 補上佔位 origin）。只用 `new URL()` 切出 origin/pathname/query 三段（這一步本身不會
 * 對 query 做任何解碼，`url.search` 回傳的是未經處理的原始字串），query 內容的 key
 * 判定完全交給 `redactRawQuery`，不借助 `url.searchParams` 的 lenient 解碼。
 *
 * 解析失敗時 fail closed：整段 query string 直接捨棄（只保留 path，絕對 URL 保留
 * origin），而不是回傳原始字串——寧可多丟一點診斷用的查詢參數，也不能讓無法正確遮蔽
 * 的座標原封不動流出去。這個規則同時涵蓋「整個 URL 無法解析」（如畸形 scheme）與
 * 「query 裡有任一 key 解碼失敗」兩種情況。
 */
export function redactCoordsFromUrl(urlOrPath: string): string {
  try {
    const url = new URL(urlOrPath, RELATIVE_URL_BASE);
    const isRelativeInput = url.origin === RELATIVE_URL_BASE;
    const origin = isRelativeInput ? '' : url.origin;
    const rawQuery = url.search.startsWith('?') ? url.search.slice(1) : url.search;

    const redacted = redactRawQuery(rawQuery);
    if (redacted === null) {
      // fail closed：任一 key 解碼失敗，整段 query 捨棄，只留 path（+ 絕對 URL 的 origin）。
      return origin + url.pathname;
    }

    const query = redacted ? `?${redacted}` : '';
    return origin + url.pathname + query;
  } catch {
    return urlOrPath.split('?')[0];
  }
}

/**
 * 遮蔽單純 query string（可能帶或不帶開頭的 `?`），用於 Sentry span/trace data 裡只存
 * query 部分、不含 path 的欄位（如 `http.query`/`url.query`）。
 * 任一 key 解碼失敗，或輸入本身就是空字串，皆回傳空字串（fail closed）。
 */
export function redactCoordsFromQueryString(queryString: string): string {
  const hasLeadingMark = queryString.startsWith('?');
  const rawQuery = hasLeadingMark ? queryString.slice(1) : queryString;

  const redacted = redactRawQuery(rawQuery);
  if (!redacted) return '';

  return hasLeadingMark ? `?${redacted}` : redacted;
}
