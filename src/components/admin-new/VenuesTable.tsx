'use client';

import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import type { AdminPagination } from '@/lib/api';
import type { Venue } from '@/types';

// ─── Table CSS ────────────────────────────────────────────────────────────────

const tableWrapper = css({
  flex: 1,
  overflowX: 'auto',
  paddingX: '4',
  paddingY: '3',
  md: {
    paddingX: '6',
  },
});

const table = css({
  width: '100%',
  borderCollapse: 'collapse',
  display: 'none',
  md: {
    display: 'table',
  },
});

const thead = css({
  borderBottom: '2px solid',
  borderBottomColor: 'color.border.light',
});

const thCheckbox = css({
  paddingX: '3',
  paddingY: '2.5',
  width: '40px',
  textAlign: 'center',
  verticalAlign: 'middle',
});

const thName = css({
  paddingX: '3',
  paddingY: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  minWidth: '180px',
});

const thRegion = css({
  paddingX: '3',
  paddingY: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  width: '80px',
});

const thStatus = css({
  paddingX: '3',
  paddingY: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  width: '100px',
});

const thDate = css({
  paddingX: '3',
  paddingY: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  width: '140px',
});

const thActions = css({
  paddingX: '3',
  paddingY: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  width: '160px',
});

const tr = cva({
  base: {
    borderBottom: '1px solid',
    borderBottomColor: 'color.border.light',
    '&:hover': {
      background: 'gray.50',
    },
  },
  variants: {
    inactive: {
      true: {
        color: 'color.text.secondary',
      },
    },
  },
});

const tdCheckbox = css({
  paddingX: '3',
  paddingY: '3',
  textAlign: 'center',
  verticalAlign: 'middle',
  width: '40px',
});

const tdName = css({
  paddingX: '3',
  paddingY: '3',
  verticalAlign: 'middle',
  minWidth: '180px',
});

const tdNameText = css({
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '220px',
});

const tdAddressText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '220px',
  marginTop: '1',
});

const td = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  verticalAlign: 'middle',
});

const tdDate = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
});

const tdActions = css({
  paddingX: '3',
  paddingY: '3',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
});

// ─── Badge ────────────────────────────────────────────────────────────────────

const statusBadge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingX: '2',
    paddingY: '0.5',
    borderRadius: 'radius.sm',
    textStyle: 'caption',
    fontWeight: 'semibold',
    whiteSpace: 'nowrap',
  },
  variants: {
    status: {
      pending: { background: 'amber.50', color: 'amber.600' },
      active: { background: 'green.50', color: 'green.700' },
      inactive: { background: 'gray.100', color: 'gray.500' },
      rejected: { background: 'red.50', color: 'red.700' },
    },
  },
});

const regionBadge = css({
  display: 'inline-flex',
  alignItems: 'center',
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: 'radius.sm',
  textStyle: 'caption',
  fontWeight: 'medium',
  background: 'gray.100',
  color: 'gray.600',
  whiteSpace: 'nowrap',
});

const STATUS_LABEL: Record<string, string> = {
  pending: '審核中',
  active: '上架中',
  inactive: '已下架',
  rejected: '已拒絕',
};

// ─── Action buttons ───────────────────────────────────────────────────────────

const actionBtn = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'radius.md',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    '& svg': { width: '15px', height: '15px' },
  },
  variants: {
    variant: {
      ghost: {
        background: 'transparent',
        borderColor: 'color.border.light',
        color: 'color.text.secondary',
        '&:hover': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
          color: 'color.text.primary',
        },
      },
      destructive: {
        background: 'transparent',
        borderColor: 'red.200',
        color: 'red.600',
        '&:hover': { background: 'red.50', borderColor: 'red.500' },
        '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
      },
    },
  },
});

const actionBtnText = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    paddingX: '2.5',
    paddingY: '1.5',
    borderRadius: 'radius.md',
    border: '1px solid',
    cursor: 'pointer',
    textStyle: 'caption',
    fontWeight: 'semibold',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    '& svg': { width: '13px', height: '13px' },
  },
  variants: {
    variant: {
      ghost: {
        background: 'transparent',
        borderColor: 'color.border.light',
        color: 'color.text.secondary',
        '&:hover': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
          color: 'color.text.primary',
        },
      },
      destructive: {
        background: 'transparent',
        borderColor: 'red.200',
        color: 'red.600',
        '&:hover': { background: 'red.50', borderColor: 'red.500' },
        '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
      },
    },
  },
});

// ─── Mobile list CSS ──────────────────────────────────────────────────────────

const mobileList = css({
  display: 'flex',
  flexDirection: 'column',
  md: { display: 'none' },
});

const mobileRow = cva({
  base: {
    paddingX: '4',
    paddingY: '3',
    borderBottom: '1px solid',
    borderBottomColor: 'color.border.light',
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    '&:hover': { background: 'gray.50' },
  },
  variants: {
    inactive: {
      true: {
        color: 'color.text.secondary',
      },
    },
  },
});

const mobileRowLine1 = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minWidth: 0,
});

const mobileCheckboxWrapper = css({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
});

const mobileRowTitle = css({
  flex: 1,
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
});

const mobileRowActions = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  flexShrink: 0,
});

const mobileRowLine2 = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  textStyle: 'caption',
  color: 'gray.600',
  minWidth: 0,
  paddingLeft: '44px',
});

const mobileRowAddress = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '140px',
});

// ─── State / Pagination CSS ───────────────────────────────────────────────────

const stateBox = css({
  paddingX: '4',
  paddingY: '10',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const retryBtn = css({
  paddingX: '4',
  paddingY: '2',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary' },
});

const paginationBar = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '4',
  paddingY: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  md: { paddingX: '6' },
});

const paginationInfo = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const paginationBtns = css({
  display: 'flex',
  gap: '2',
  alignItems: 'center',
});

const paginationBtn = cva({
  base: {
    paddingX: '3',
    paddingY: '1.5',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.md',
    background: 'white',
    color: 'color.text.primary',
    textStyle: 'caption',
    cursor: 'pointer',
    '&:hover:not(:disabled)': { background: 'color.background.secondary' },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: { _seconds: number } | string | undefined): string {
  if (!ts) return '—';
  const date =
    typeof ts === 'string' ? new Date(ts) : new Date((ts as { _seconds: number })._seconds * 1000);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function canDelete(venue: Venue): boolean {
  return venue.status === 'inactive' && venue.eventCount === 0;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonTableRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className={tr()}>
          <td className={tdCheckbox}>
            <Skeleton width="16px" height="16px" borderRadius="3px" />
          </td>
          <td className={tdName}>
            <Skeleton width="70%" height="16px" />
            <div className={css({ marginTop: '4px' })}>
              <Skeleton width="90%" height="13px" />
            </div>
          </td>
          <td className={td}>
            <Skeleton width="48px" height="20px" borderRadius="4px" />
          </td>
          <td className={td}>
            <Skeleton width="56px" height="20px" borderRadius="4px" />
          </td>
          <td className={td}>
            <Skeleton width="80px" height="16px" />
          </td>
          <td className={tdActions}>
            <div className={css({ display: 'flex', gap: '1' })}>
              <Skeleton width="32px" height="32px" borderRadius="6px" />
              <Skeleton width="32px" height="32px" borderRadius="6px" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function SkeletonMobileRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={mobileRow()}>
          <div className={mobileRowLine1}>
            <Skeleton width="44px" height="44px" borderRadius="4px" />
            <Skeleton width="48px" height="20px" borderRadius="4px" />
            <Skeleton width="55%" height="16px" />
          </div>
          <div className={mobileRowLine2}>
            <Skeleton width="100px" height="14px" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── VenuesTable ──────────────────────────────────────────────────────────────

interface VenuesTableProps {
  venues: Venue[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  debouncedSearch: string;
  onClearSearch: () => void;
  onDelete: (venue: Venue) => void;
  refetch: () => void;
  pagination: AdminPagination | undefined;
  onPageChange: (page: number) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export default function VenuesTable({
  venues,
  isLoading,
  isError,
  emptyMessage,
  debouncedSearch,
  onClearSearch,
  onDelete,
  refetch,
  pagination,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: VenuesTableProps) {
  const router = useRouter();

  const allSelected = venues.length > 0 && venues.every((v) => selectedIds.has(v.id));
  const someSelected = venues.some((v) => selectedIds.has(v.id)) && !allSelected;

  return (
    <>
      <div className={tableWrapper}>
        {/* Desktop table */}
        <table className={table} aria-label="場地列表">
          <thead className={thead}>
            <tr>
              <th className={thCheckbox}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="全選目前頁所有場地"
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th className={thName}>場地名稱</th>
              <th className={thRegion}>地區</th>
              <th className={thStatus}>狀態</th>
              <th className={thDate}>建立時間</th>
              <th className={thActions}>操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonTableRows />}
            {!isLoading &&
              !isError &&
              venues.map((venue) => (
                <tr key={venue.id} className={tr({ inactive: venue.status === 'inactive' })}>
                  <td className={tdCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(venue.id)}
                      onChange={() => onToggleSelect(venue.id)}
                      aria-label={`選取 ${venue.name}`}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td className={tdName}>
                    <div className={tdNameText}>{venue.name}</div>
                    <div className={tdAddressText}>{venue.address}</div>
                  </td>
                  <td className={td}>
                    <span className={regionBadge}>{venue.region}</span>
                  </td>
                  <td className={td}>
                    <span className={statusBadge({ status: venue.status })}>
                      {STATUS_LABEL[venue.status] ?? venue.status}
                    </span>
                  </td>
                  <td className={tdDate}>{formatDate(venue.updatedAt)}</td>
                  <td className={tdActions}>
                    <div className={css({ display: 'flex', gap: '1', alignItems: 'center' })}>
                      <button
                        type="button"
                        className={actionBtnText({ variant: 'ghost' })}
                        onClick={() => router.push(`/admin-new/venues/${venue.id}/edit`)}
                        aria-label={`編輯 ${venue.name}`}
                      >
                        <PencilIcon aria-hidden="true" />
                        編輯
                      </button>
                      {canDelete(venue) && (
                        <button
                          type="button"
                          className={actionBtnText({ variant: 'destructive' })}
                          onClick={() => onDelete(venue)}
                          aria-label={`永久刪除 ${venue.name}`}
                        >
                          <TrashIcon aria-hidden="true" />
                          刪除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Mobile list */}
        <div className={mobileList} aria-label="場地列表">
          {isLoading && <SkeletonMobileRows />}
          {!isLoading &&
            !isError &&
            venues.map((venue) => (
              <div key={venue.id} className={mobileRow({ inactive: venue.status === 'inactive' })}>
                <div className={mobileRowLine1}>
                  <div className={mobileCheckboxWrapper}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(venue.id)}
                      onChange={() => onToggleSelect(venue.id)}
                      aria-label={`選取 ${venue.name}`}
                      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                    />
                  </div>
                  <span className={statusBadge({ status: venue.status })}>
                    {STATUS_LABEL[venue.status] ?? venue.status}
                  </span>
                  <span className={mobileRowTitle}>{venue.name}</span>
                  <div className={mobileRowActions}>
                    <button
                      type="button"
                      className={actionBtn({ variant: 'ghost' })}
                      onClick={() => router.push(`/admin-new/venues/${venue.id}/edit`)}
                      aria-label={`編輯 ${venue.name}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </button>
                    {canDelete(venue) && (
                      <button
                        type="button"
                        className={actionBtn({ variant: 'destructive' })}
                        onClick={() => onDelete(venue)}
                        aria-label={`永久刪除 ${venue.name}`}
                      >
                        <TrashIcon aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                <div className={mobileRowLine2}>
                  <span className={regionBadge}>{venue.region}</span>
                  <span>·</span>
                  <span className={mobileRowAddress}>{venue.address}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Error state */}
        {isError && (
          <div className={stateBox} role="alert">
            <span>載入資料失敗，請確認網路連線後重試</span>
            <button className={retryBtn} onClick={() => refetch()} type="button">
              重試
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && venues.length === 0 && (
          <div className={stateBox}>
            <span>{emptyMessage}</span>
            {debouncedSearch ? (
              <button className={retryBtn} onClick={onClearSearch} type="button">
                清除搜尋
              </button>
            ) : (
              <a href="/admin-new/venues/new" className={retryBtn}>
                新增第一間場地
              </a>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && pagination && pagination.totalPages > 1 && (
        <div className={paginationBar}>
          <span className={paginationInfo}>
            第 {pagination.page} 頁，共 {pagination.totalPages} 頁・共 {pagination.total} 筆
          </span>
          <div className={paginationBtns}>
            <button
              className={paginationBtn()}
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              type="button"
            >
              上一頁
            </button>
            <button
              className={paginationBtn()}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              type="button"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </>
  );
}
