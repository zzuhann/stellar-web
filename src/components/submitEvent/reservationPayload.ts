import { EventSubmissionFormData } from '@/lib/validations';
import { taipeiDateTimeToTimestamp } from '@/utils';
import { CoffeeEvent, FirebaseTimestamp } from '@/types';

// 組合 API 的 reservation payload；即使欄位皆空也回傳完整物件，讓編輯模式清空欄位時
// 後端能正確清除既有值
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

// 編輯/複製模式下，若既有活動已填過預約資訊，開關預設要開啟讓使用者看到原本填的資料；
// 新建活動（reservation 為 undefined）一律預設關閉
export const shouldEnableReservationByDefault = (
  reservation: CoffeeEvent['reservation']
): boolean => {
  return !!(reservation?.url || reservation?.startAt);
};
