import { EventSubmissionFormData } from '@/lib/validations';
import { taipeiDateTimeToTimestamp } from '@/utils';
import { FirebaseTimestamp } from '@/types';

// 組合 reservationUrl/reservationDate/reservationTime 為 API 的 reservation 物件。
// EventSubmissionForm（一般投稿/編輯）與 EventImportForm（貼文匯入）共用同一個
// eventSubmissionSchema，這裡也共用同一份組 payload 邏輯，避免兩處各寫一份。
// 永遠回傳完整物件（不因為欄位為空就整個省略），讓編輯模式清空欄位時後端能正確清除既有值
// （語意見 specs/features/event-reservation/design-backend.md〈清除語意〉）。
export const buildReservationPayload = (
  data: EventSubmissionFormData
): { url?: string; startAt?: FirebaseTimestamp } => {
  const url = data.reservationUrl?.trim();
  const { reservationDate, reservationTime } = data;

  return {
    url: url || undefined,
    startAt:
      reservationDate && reservationTime
        ? taipeiDateTimeToTimestamp(reservationDate, `${reservationTime}:00`)
        : undefined,
  };
};
