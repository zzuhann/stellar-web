'use client';

import { css } from '@/styled-system/css';
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import type { Venue } from '@/types';
import Image from 'next/image';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';

const card = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  position: 'relative',
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
  },
});

const cardSelected = css({
  borderColor: 'color.primary',
  boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
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

const pendingBadge = css({
  background: 'orange.400',
  color: 'white',
});

const rejectedBadge = css({
  background: 'red.500',
  color: 'white',
});

const checkboxInput = css({
  position: 'absolute',
  top: '8px',
  left: '8px',
  zIndex: 10,
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  accentColor: 'var(--colors-stellar-blue-500)',
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
  transition: 'background 0.2s ease, border-color 0.2s ease',
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

const STATUS_BADGE_MAP: Record<Venue['status'], { badgeClass: string; label: string }> = {
  active: { badgeClass: activeBadge, label: '開放中' },
  inactive: { badgeClass: inactiveBadge, label: '已下架' },
  pending: { badgeClass: pendingBadge, label: '待審核' },
  rejected: { badgeClass: rejectedBadge, label: '已拒絕' },
};

type VenueCardProps = {
  venue: Venue;
  onEdit: (venue: Venue) => void;
  onDeactivate: (venue: Venue) => void;
  onActivate: (venue: Venue) => void;
  isUpdating?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (venueId: string) => void;
};

export default function VenueCard({
  venue,
  onEdit,
  onDeactivate,
  onActivate,
  isUpdating,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}: VenueCardProps) {
  const isInactive = venue.status === 'inactive';
  const { badgeClass, label } = STATUS_BADGE_MAP[venue.status] ?? STATUS_BADGE_MAP.active;

  const handleCardClick = () => {
    if (isSelectMode && onSelect) {
      onSelect(venue.id);
    }
  };

  return (
    <div
      className={`${card} ${isSelected ? cardSelected : ''}`}
      onClick={handleCardClick}
      style={isSelectMode ? { cursor: 'pointer' } : undefined}
    >
      <div className={coverContainer}>
        {isSelectMode ? (
          <input
            type="checkbox"
            className={checkboxInput}
            checked={isSelected}
            onChange={() => onSelect?.(venue.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`選取 ${venue.name}`}
          />
        ) : (
          <span className={`${statusBadge} ${badgeClass}`}>{label}</span>
        )}
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

        {(venue.capacityRange !== null || venue.eventCount > 0) && (
          <div className={statsRow}>
            {venue.capacityRange !== null && (
              <div className={statItem}>
                <UserGroupIcon />
                <span>{CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange}</span>
              </div>
            )}
            {venue.eventCount > 0 && (
              <div className={statItem}>
                <CalendarDaysIcon />
                <span>{venue.eventCount} 場生咖</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={actions}>
        <button
          className={`${actionBtn} ${editBtn}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(venue);
          }}
          disabled={isUpdating}
        >
          <PencilSquareIcon />
          編輯
        </button>
        {/* Only show activate/deactivate for active/inactive venues; pending/rejected handled via batch */}
        {(venue.status === 'active' || venue.status === 'inactive') &&
          (isInactive ? (
            <button
              className={`${actionBtn} ${activateBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onActivate(venue);
              }}
              disabled={isUpdating}
            >
              <ArrowPathIcon />
              上架
            </button>
          ) : (
            <button
              className={`${actionBtn} ${deactivateBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onDeactivate(venue);
              }}
              disabled={isUpdating}
            >
              <TrashIcon />
              下架
            </button>
          ))}
      </div>
    </div>
  );
}
