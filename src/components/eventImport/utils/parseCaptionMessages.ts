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
 * - `success:false`（Gemini quota/服務/格式問題）：不論哪個 reason，都是系統性錯誤 (b)，
 *   對應 design-backend.md 的判斷——`parse_failed` 是 Gemini 輸出格式不符預期的技術性失敗，
 *   不是「這段文案沒有活動資訊」；後者只會發生在 `success:true` 但欄位全部是 null 的情況。
 * - `success:true` 但所有欄位皆為 null：文案解析不出任何內容 (a)。
 * - `success:true` 且至少一個欄位有值：不顯示常駐錯誤，改用 toast 呈現。
 */
export function resolveParseCaptionError(
  response: ParseCaptionResponse | undefined,
  requestError: unknown
): string | null {
  if (requestError) return PARSE_SYSTEM_ERROR_MESSAGE;
  if (!response) return null;
  // 後端不同來源的失敗訊息落在不同欄位：200 success:false／503 用 `message`／`error`，
  // 400（validateRequest 中介層攔截）只有 `error`（lib/api/import.ts 會把中介層的
  // `{ error, code, field }` 正規化進同一個 union，欄位名稱維持原樣，不強制改名）。
  if (!response.success) return response.message || response.error || PARSE_SYSTEM_ERROR_MESSAGE;
  return isParsedEmpty(response.parsed) ? PARSE_NO_CONTENT_MESSAGE : null;
}
