import { FetchImageReason, FetchImageResponse } from '@/types';

// design-frontend.md〈畫面規格〉第 5 點定義了三種文案；後端實際回傳 5 種 reason
// （design-backend.md），這裡把語意相近的 reason 收斂進同一組文案：
// - fetch_failed / blocked_host：網址本身連不上或被拒絕，對管理員來說都是「來源失效」
// - invalid_content_type：抓到的內容不是圖片
// - unsupported_format / size_out_of_range：抓到圖片，但不符合上傳規則
const REASON_MESSAGES: Partial<Record<FetchImageReason, string>> = {
  fetch_failed: '網址已失效，請確認來源是否還存在',
  blocked_host: '網址已失效，請確認來源是否還存在',
  invalid_content_type: '這個網址不是圖片，請確認貼的是圖片直連',
  unsupported_format: '圖片格式不支援',
  size_out_of_range: '圖片格式不支援',
};

const FALLBACK_MESSAGE = '圖片抓取失敗，請重試';

export function resolveFetchImageErrorMessage(
  response: FetchImageResponse | undefined,
  requestFailed: unknown
): string {
  if (response && !response.success) {
    if (response.reason && REASON_MESSAGES[response.reason]) {
      return REASON_MESSAGES[response.reason] as string;
    }
    return response.error || FALLBACK_MESSAGE;
  }
  if (requestFailed) return FALLBACK_MESSAGE;
  return FALLBACK_MESSAGE;
}
