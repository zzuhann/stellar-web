import { ParseCaptionResponse, ParsedCaptionData } from '@/types';

// design-frontend.md〈畫面規格〉第 6 點的兩種常駐錯誤文案
export const PARSE_NO_CONTENT_MESSAGE =
  '無法從這段文字判斷任何活動資訊，請確認貼上的是完整貼文文案，或直接手動填寫下方欄位。';
export const PARSE_SYSTEM_ERROR_MESSAGE = '解析發生錯誤，請稍後再試。';

// 注意：這裡刻意不看 `description`——`description` 現在是「文案原文整段」，只要有貼上
// 文案就一定有內容，跟 Gemini 這次有沒有抽到任何活動資訊無關，不該拿來判斷「解析有沒有
// 抽出東西」（否則這個判斷永遠是 false，(a) 的錯誤文案就再也不會出現）。
export function isParsedEmpty(parsed: ParsedCaptionData): boolean {
  return (
    !parsed.title &&
    !parsed.artistName &&
    !parsed.eventDateStart &&
    !parsed.eventDateEnd &&
    !parsed.location &&
    !parsed.socialMedia
  );
}

/**
 * 判斷文案解析後要不要顯示常駐錯誤文字，以及顯示哪一種。
 * - `requestError` 有值：呼叫本身失敗（網路層或非 200 的 HTTP 錯誤），一律視為系統性錯誤 (b)。
 * - `success:false`（Gemini quota/服務/格式問題，或 400/503 等後端錯誤）：不論後端回傳的
 *   `message`/`error`/`reason` 是什麼，一律顯示統一的系統性錯誤文案 (b)，不把後端內部錯誤訊息
 *   直接暴露給管理員（design-frontend.md〈畫面規格〉第 6 點 (b)：兩種情況文案固定、不隨後端
 *   回傳內容變動）。對應 design-backend.md 的判斷——`parse_failed` 是 Gemini 輸出格式不符預期的
 *   技術性失敗，不是「這段文案沒有活動資訊」；後者只會發生在 `success:true` 但欄位全部是 null
 *   的情況。
 * - `success:true` 但所有欄位皆為 null：文案解析不出任何內容 (a)。
 * - `success:true` 且至少一個欄位有值：不顯示常駐錯誤，改用 toast 呈現。
 */
export function resolveParseCaptionError(
  response: ParseCaptionResponse | undefined,
  requestError: unknown
): string | null {
  if (requestError) return PARSE_SYSTEM_ERROR_MESSAGE;
  if (!response) return null;
  if (!response.success) return PARSE_SYSTEM_ERROR_MESSAGE;
  return isParsedEmpty(response.parsed) ? PARSE_NO_CONTENT_MESSAGE : null;
}
