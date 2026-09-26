'use client';

import { useSyncExternalStore } from 'react';
import { css } from '@/styled-system/css';
import { CalendarIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import ExternalLink from '../ui/ExternalLink';
import {
  formatReservationDateTime,
  generateGoogleCalendarUrlAtTime,
  isPastTimestamp,
} from '@/utils';
import type { FirebaseTimestamp } from '@/types';

const detailItem = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
  padding: '1',
});

const detailIcon = css({
  flexShrink: '0',
  marginTop: '0.5',
});

const detailContent = css({
  flex: '1',
  minWidth: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const detailValue = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  flexWrap: 'wrap',
  overflowWrap: 'break-word',
});

const dateRowLink = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
  padding: '1',
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: 'radius.md',
  transition: 'background-color 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'color.background.secondary',
  },
});

const addToCalendarHint = css({
  textStyle: 'caption',
  color: 'color.link',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  marginTop: '0.5',
});

// 「預約開始時間」列專用：時間文字與提醒 hint 並排同一行，跟其他列的上下堆疊不同
const reservationCalendarContent = css({
  flex: '1',
  minWidth: '0',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: '2',
  rowGap: '0.5',
});

// useSyncExternalStore 沒有實際的外部事件來源（不需要「時間一到就重新渲染」這種即時性），
// subscribe 給 no-op 即可；重點是 getServerSnapshot 固定回傳 false，
// 讓 SSR 輸出跟 client 第一次 render 一致，避免 hydration mismatch，
// 之後才在 client 用瀏覽器當下時間算出真正的值
const subscribe = () => () => {};

interface ReservationReminderRowProps {
  startAt: FirebaseTimestamp;
  eventTitle: string;
  locationText: string;
  eventSlugOrId: string;
  eventId: string;
}

/**
 * 預約開始時間列。過期判斷（isPastTimestamp）需要瀏覽器當下時間，但 EventDetail
 * 是 Server Component，ISR 生效後 SSR 當下的時間會被凍結進快取頁面，之後每個訪客
 * 看到的「過期與否」都停留在頁面渲染當時，不會隨時間更新。
 *
 * 因此這裡固定先以安全預設（純文字時間、不含「提醒我預約」連結）完成第一次 render，
 * 跟 SSR 輸出一致，避免 hydration mismatch；mount 後才用瀏覽器當下時間判斷一次，
 * 未過期才升級成可點擊的「提醒我預約」連結。
 */
const ReservationReminderRow = ({
  startAt,
  eventTitle,
  locationText,
  eventSlugOrId,
  eventId,
}: ReservationReminderRowProps) => {
  const showReminderLink = useSyncExternalStore(
    subscribe,
    () => !isPastTimestamp(startAt),
    () => false
  );

  if (!showReminderLink) {
    return (
      <div className={detailItem}>
        <div className={detailIcon}>
          <CalendarIcon
            width={20}
            height={20}
            color="var(--color-text-secondary)"
            aria-hidden="true"
          />
          <span className="sr-only">預約開始時間</span>
        </div>
        <div className={detailContent}>
          <div className={detailValue}>{formatReservationDateTime(startAt)}</div>
        </div>
      </div>
    );
  }

  return (
    <ExternalLink
      href={generateGoogleCalendarUrlAtTime({
        title: `[預約提醒] - ${eventTitle}`,
        startAt,
        location: locationText,
        eventSlugOrId,
      })}
      platform="reservation_calendar"
      eventPage="/event/[id]"
      contentId={eventId}
      className={dateRowLink}
    >
      <div className={detailIcon}>
        <CalendarIcon
          width={20}
          height={20}
          color="var(--color-text-secondary)"
          aria-hidden="true"
        />
        <span className="sr-only">預約開始時間，點擊提醒我預約</span>
      </div>
      <div className={reservationCalendarContent}>
        <div className={detailValue}>{formatReservationDateTime(startAt)}</div>
        <div className={addToCalendarHint} style={{ marginTop: 0 }}>
          提醒我預約
          <ArrowTopRightOnSquareIcon width={12} height={12} aria-hidden="true" />
        </div>
      </div>
    </ExternalLink>
  );
};

export default ReservationReminderRow;
