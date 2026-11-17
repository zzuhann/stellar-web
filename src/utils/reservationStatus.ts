import type { ReservationEventItem } from '@/types';

export type ReservationLabelVariant = 'section' | 'card';

export interface ReservationLabel {
  kind: 'upcoming' | 'open';
  text: string;
}

const MAX_LIST_SIZE = 20;

// Accepts untyped API/hand-written data; anything that is not a finite timestamp is "unset"
function parseTimestamp(value: unknown): Date | null {
  if (typeof value !== 'object' || value === null) return null;
  const seconds = (value as { _seconds?: unknown })._seconds;
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

const openTimeFormatter = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  // hour12:false can print 24:00 at midnight on some ICU builds
  hourCycle: 'h23',
});

// e.g. 11/21（六）14:00, always Asia/Taipei
export function formatReservationOpenTime(startAt: unknown): string {
  const date = parseTimestamp(startAt);
  if (!date) return '';
  const parts = openTimeFormatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const weekday = get('weekday').replace('週', '');
  return `${get('month')}/${get('day')}（${weekday}）${get('hour')}:${get('minute')}`;
}

// Strictly in the future counts as upcoming; equal to now is already open (matches the backend)
export function getReservationLabel(
  startAt: unknown,
  now: Date,
  variant: ReservationLabelVariant
): ReservationLabel {
  const date = parseTimestamp(startAt);
  if (date && date.getTime() > now.getTime()) {
    const suffix = variant === 'card' ? '開放預約' : '開放';
    return { kind: 'upcoming', text: `${formatReservationOpenTime(startAt)} ${suffix}` };
  }
  return { kind: 'open', text: '已開放預約' };
}

// Re-derives inclusion, grouping and order from `now` so ISR/staleTime cannot freeze them
export function buildReservationList(
  events: ReservationEventItem[],
  now: Date,
  max = MAX_LIST_SIZE
): ReservationEventItem[] {
  const nowMs = now.getTime();
  const rows = events.flatMap((event) => {
    const start = parseTimestamp(event.datetime?.start);
    const end = parseTimestamp(event.datetime?.end);
    if (!start || !end || end.getTime() <= nowMs) return [];
    if (!event.reservation?.url?.trim()) return [];
    const openAt = parseTimestamp(event.reservation.startAt);
    const openAtMs = openAt && openAt.getTime() > nowMs ? openAt.getTime() : null;
    return [{ event, startMs: start.getTime(), openAtMs }];
  });

  rows.sort((a, b) => {
    if (a.openAtMs !== null && b.openAtMs !== null && a.openAtMs !== b.openAtMs) {
      return a.openAtMs - b.openAtMs;
    }
    if ((a.openAtMs !== null) !== (b.openAtMs !== null)) return a.openAtMs !== null ? -1 : 1;
    if (a.startMs !== b.startMs) return a.startMs - b.startMs;
    return a.event.id < b.event.id ? -1 : a.event.id > b.event.id ? 1 : 0;
  });

  return rows.slice(0, max).map((row) => row.event);
}
