'use client';

import { css } from '@/styled-system/css';
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import type { Venue } from '@/types';
import Image from 'next/image';

const card = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
  },
});

const coverContainer = css({
  position: 'relative',
  width: '100%',
  aspectRatio: '16/9',
  background: 'gray.100',
  flexShrink: 0,
  overflow: 'hidden',
});

const coverPlaceholder = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  background: 'gray.100',
  color: 'gray.400',
});

const statusBadge = css({
  position: 'absolute',
  top: '8px',
  left: '8px',
  fontSize: '11px',
  fontWeight: 600,
  paddingY: '0.5',
  paddingX: '2',
  borderRadius: 'radius.md',
  zIndex: 1,
});

const activeBadge = css({
  background: 'green.500',
  color: 'white',
});

const inactiveBadge = css({
  background: 'gray.500',
  color: 'white',
});

const body = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  flex: 1,
});

const venueName = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  margin: 0,
  overflow: 'hidden',
  lineClamp: 2,
});

const metaRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
  textStyle: 'caption',
  color: 'color.text.secondary',
  '& svg': {
    width: '12px',
    height: '12px',
    flexShrink: 0,
  },
});

const statsRow = css({
  display: 'flex',
  gap: '3',
  marginTop: '1',
});

const statItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
  '& svg': {
    width: '12px',
    height: '12px',
    color: 'color.primary',
  },
});

const actions = css({
  padding: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  display: 'flex',
  gap: '2',
  background: 'white',
});

const actionBtn = css({
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid',
  transition: 'all 0.2s ease',
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  '& svg': {
    width: '13px',
    height: '13px',
  },
});

const editBtn = css({
  background: 'white',
  borderColor: 'color.border.light',
  color: 'color.text.primary',
  '&:hover:not(:disabled)': {
    background: 'gray.50',
    borderColor: 'gray.300',
  },
});

const deactivateBtn = css({
  background: 'white',
  borderColor: 'red.200',
  color: 'red.700',
  '&:hover:not(:disabled)': {
    background: 'red.50',
    borderColor: 'red.300',
  },
});

const activateBtn = css({
  background: 'white',
  borderColor: 'green.200',
  color: 'green.700',
  '&:hover:not(:disabled)': {
    background: 'green.50',
    borderColor: 'green.300',
  },
});

type VenueCardProps = {
  venue: Venue;
  onEdit: (venue: Venue) => void;
  onDeactivate: (venue: Venue) => void;
  onActivate: (venue: Venue) => void;
  isUpdating?: boolean;
};

export default function VenueCard({
  venue,
  onEdit,
  onDeactivate,
  onActivate,
  isUpdating,
}: VenueCardProps) {
  const isInactive = venue.status === 'inactive';

  return (
    <div className={card}>
      <div className={coverContainer}>
        <span className={`${statusBadge} ${isInactive ? inactiveBadge : activeBadge}`}>
          {isInactive ? '已下架' : '開放中'}
        </span>
        {venue.coverPhoto ? (
          <Image
            src={venue.coverPhoto}
            alt={venue.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={coverPlaceholder}>🏢</div>
        )}
      </div>

      <div className={body}>
        <h3 className={venueName}>{venue.name}</h3>

        <div className={metaRow}>
          <MapPinIcon />
          <span>
            {venue.region}．{venue.address}
          </span>
        </div>

        <div className={statsRow}>
          {venue.capacity_max !== null && (
            <div className={statItem}>
              <UserGroupIcon />
              <span>最多 {venue.capacity_max} 人</span>
            </div>
          )}
          <div className={statItem}>
            <CalendarDaysIcon />
            <span>{venue.eventCount} 場生咖</span>
          </div>
        </div>
      </div>

      <div className={actions}>
        <button
          className={`${actionBtn} ${editBtn}`}
          onClick={() => onEdit(venue)}
          disabled={isUpdating}
        >
          <PencilSquareIcon />
          編輯
        </button>
        {isInactive ? (
          <button
            className={`${actionBtn} ${activateBtn}`}
            onClick={() => onActivate(venue)}
            disabled={isUpdating}
          >
            <ArrowPathIcon />
            上架
          </button>
        ) : (
          <button
            className={`${actionBtn} ${deactivateBtn}`}
            onClick={() => onDeactivate(venue)}
            disabled={isUpdating}
          >
            <TrashIcon />
            下架
          </button>
        )}
      </div>
    </div>
  );
}
