'use client';

import { ClockIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useClientNow } from '@/hooks/useClientNow';
import { getReservationLabel, getReservationUrl } from '@/utils/reservationStatus';
import type { CoffeeEvent } from '@/types';

const badge = css({
  position: 'absolute',
  top: '2',
  left: '2',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  paddingY: '1',
  paddingX: '2',
  borderRadius: 'radius.sm',
  background: 'gray.0',
  textStyle: 'caption',
  fontWeight: 'semibold',
});

const upcomingColor = css({ color: 'color.primary' });
const openColor = css({ color: 'color.text.primary' });

interface ReservationBadgeProps {
  reservation?: CoffeeEvent['reservation'];
}

// Poster-corner tag; renders only after mount so the ISR HTML never freezes the label
export default function ReservationBadge({ reservation }: ReservationBadgeProps) {
  const now = useClientNow();

  if (!reservation || !getReservationUrl(reservation) || !now) return null;

  const { kind, text } = getReservationLabel(reservation.startAt, now, 'card');
  const isUpcoming = kind === 'upcoming';

  return (
    <span className={`${badge} ${isUpcoming ? upcomingColor : openColor}`}>
      {isUpcoming && <ClockIcon width={14} height={14} aria-hidden="true" />}
      {text}
    </span>
  );
}
