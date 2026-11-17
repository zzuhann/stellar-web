import type { ReservationEventItem } from '@/types';

export type ReservationLabelVariant = 'section' | 'card';

export interface ReservationLabel {
  kind: 'upcoming' | 'open';
  text: string;
}

const NOT_IMPLEMENTED = 'reservationStatus: not implemented';

export function formatReservationOpenTime(_startAt: unknown): string {
  throw new Error(NOT_IMPLEMENTED);
}

export function getReservationLabel(
  _startAt: unknown,
  _now: Date,
  _variant: ReservationLabelVariant
): ReservationLabel {
  throw new Error(NOT_IMPLEMENTED);
}

export function buildReservationList(
  _events: ReservationEventItem[],
  _now: Date,
  _max = 20
): ReservationEventItem[] {
  throw new Error(NOT_IMPLEMENTED);
}
