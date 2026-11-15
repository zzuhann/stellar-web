import { EventSubmissionFormData } from '@/lib/validations';
import { taipeiDateTimeToTimestamp } from '@/utils';

// untilGone has no end date; datetime.end is only the takedown time (start + 7 days, the admins' existing practice)
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
