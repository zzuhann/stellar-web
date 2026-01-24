import { FirebaseTimestamp } from '@/types';
import { firebaseTimestampToDate } from '@/utils';

export const formatEventDate = (startDate: FirebaseTimestamp, endDate: FirebaseTimestamp) => {
  const start = firebaseTimestampToDate(startDate);
  const end = firebaseTimestampToDate(endDate);

  const startStr = start.toLocaleDateString('zh-TW');

  const endStr = end.toLocaleDateString('zh-TW');

  return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
};
