'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import type { Venue } from '@/types';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const actionBar = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingX: '4',
  paddingY: '3',
  background: 'stellarBlue.50',
  borderBottom: '1px solid',
  borderBottomColor: 'stellarBlue.200',
  flexWrap: 'wrap',
  md: {
    paddingX: '6',
  },
});

const clearBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'stellarBlue.200',
  background: 'transparent',
  color: 'stellarBlue.600',
  cursor: 'pointer',
  flexShrink: 0,
  '&:hover': {
    background: 'stellarBlue.100',
  },
  '& svg': { width: '14px', height: '14px' },
});

const countText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  flexShrink: 0,
});

const btnGroup = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  flexWrap: 'wrap',
});

const actionBtnStyle = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    paddingX: '3',
    paddingY: '1.5',
    borderRadius: 'radius.md',
    border: '1px solid',
    cursor: 'pointer',
    textStyle: 'caption',
    fontWeight: 'semibold',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      approve: {
        background: 'transparent',
        borderColor: 'green.300',
        color: 'green.700',
        '&:hover:not(:disabled)': { background: 'green.50', borderColor: 'green.500' },
      },
      reject: {
        background: 'transparent',
        borderColor: 'red.200',
        color: 'red.600',
        '&:hover:not(:disabled)': { background: 'red.50', borderColor: 'red.400' },
      },
      offline: {
        background: 'transparent',
        borderColor: 'color.border.light',
        color: 'color.text.secondary',
        '&:hover:not(:disabled)': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
        },
      },
      online: {
        background: 'transparent',
        borderColor: 'green.300',
        color: 'green.700',
        '&:hover:not(:disabled)': { background: 'green.50', borderColor: 'green.500' },
      },
    },
  },
});

const spinnerStyle = css({
  width: '12px',
  height: '12px',
  border: '2px solid transparent',
  borderTopColor: 'currentColor',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
});

const hintText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type VenueBatchAction = 'approve' | 'reject' | 'offline' | 'online';

interface VenueBatchActionBarProps {
  selectedVenues: Venue[];
  onClearSelection: () => void;
  onBatchAction: (action: VenueBatchAction) => void;
  isLoading: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SelectionKind = 'all-pending' | 'all-active' | 'all-inactive' | 'all-rejected' | 'mixed';

function getSelectionKind(venues: Venue[]): SelectionKind {
  if (venues.length === 0) return 'mixed';
  const statuses = new Set(venues.map((v) => v.status));
  if (statuses.size === 1) {
    const [status] = statuses;
    if (status === 'pending') return 'all-pending';
    if (status === 'active') return 'all-active';
    if (status === 'inactive') return 'all-inactive';
    if (status === 'rejected') return 'all-rejected';
  }
  return 'mixed';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueBatchActionBar({
  selectedVenues,
  onClearSelection,
  onBatchAction,
  isLoading,
}: VenueBatchActionBarProps) {
  if (selectedVenues.length === 0) return null;

  const kind = getSelectionKind(selectedVenues);
  const count = selectedVenues.length;

  return (
    <div className={actionBar} aria-live="polite" aria-label={`已選取 ${count} 間場地`}>
      <button
        type="button"
        className={clearBtn}
        onClick={onClearSelection}
        aria-label="清除所有勾選"
      >
        <XMarkIcon aria-hidden="true" />
      </button>

      <span className={countText}>已選取 {count} 間場地</span>

      <div className={btnGroup}>
        {kind === 'all-pending' && (
          <>
            <button
              type="button"
              className={actionBtnStyle({ variant: 'approve' })}
              onClick={() => onBatchAction('approve')}
              disabled={isLoading}
              aria-label="批次審核通過"
            >
              {isLoading && <span className={spinnerStyle} aria-hidden="true" />}
              審核通過
            </button>
            <button
              type="button"
              className={actionBtnStyle({ variant: 'reject' })}
              onClick={() => onBatchAction('reject')}
              disabled={isLoading}
              aria-label="批次拒絕"
            >
              {isLoading && <span className={spinnerStyle} aria-hidden="true" />}
              拒絕
            </button>
          </>
        )}

        {kind === 'all-active' && (
          <button
            type="button"
            className={actionBtnStyle({ variant: 'offline' })}
            onClick={() => onBatchAction('offline')}
            disabled={isLoading}
            aria-label="批次下架"
          >
            {isLoading && <span className={spinnerStyle} aria-hidden="true" />}
            批次下架
          </button>
        )}

        {kind === 'all-inactive' && (
          <button
            type="button"
            className={actionBtnStyle({ variant: 'online' })}
            onClick={() => onBatchAction('online')}
            disabled={isLoading}
            aria-label="批次上架"
          >
            {isLoading && <span className={spinnerStyle} aria-hidden="true" />}
            批次上架
          </button>
        )}

        {kind === 'all-rejected' && <span className={hintText}>已拒絕的場地無法進行批次操作</span>}

        {kind === 'mixed' && <span className={hintText}>請勾選相同狀態的場地才能執行批次操作</span>}
      </div>
    </div>
  );
}
