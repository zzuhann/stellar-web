import { EventSubmissionFormData } from '@/lib/validations';
import { taipeiDateTimeToTimestamp } from '@/utils';

// 領完為止沒有結束日，datetime.end 只當下架時間：沿用管理員至今「開始日 + 7 天」的做法
export const UNTIL_GONE_DAYS = 7;

export const buildDatetimePayload = (
  data: Pick<EventSubmissionFormData, 'startDate' | 'endDate' | 'untilGone'>
) => {
  const end = taipeiDateTimeToTimestamp(data.untilGone ? data.startDate : data.endDate, '23:59:59');
  return {
    start: taipeiDateTimeToTimestamp(data.startDate, '00:00:00'),
    // Taiwan has no DST, so adding whole days in seconds is exact
    end: data.untilGone ? { ...end, _seconds: end._seconds + UNTIL_GONE_DAYS * 86400 } : end,
  };
};
