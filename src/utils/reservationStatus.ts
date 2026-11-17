import { firebaseTimestampToDate, formatReservationDateTime, isHttpUrl } from '@/utils';
import type { FirebaseTimestamp, ReservationEventItem } from '@/types';

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
  const date = firebaseTimestampToDate(value as FirebaseTimestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

// e.g. 11/21（六）14:00, always Asia/Taipei
export function formatReservationOpenTime(startAt: unknown): string {
  const date = parseTimestamp(startAt);
  return date ? formatReservationDateTime(startAt as FirebaseTimestamp, { withYear: false }) : '';
}

// Same standard as the event page: only http(s) urls make a usable reservation link
export function getReservationUrl(reservation?: { url?: string } | null): string | null {
  const url = reservation?.url?.trim();
  return url && isHttpUrl(url) ? url : null;
}

// Strictly in the future counts as upcoming; equal to now is already open (matches the backend)
export function getReservationLabel(startAt: unknown, now: Date): ReservationLabel {
  const date = parseTimestamp(startAt);
  if (date && date.getTime() > now.getTime()) {
    return { kind: 'upcoming', text: `${formatReservationOpenTime(startAt)} 開放預約` };
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
    if (!getReservationUrl(event.reservation)) return [];
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
