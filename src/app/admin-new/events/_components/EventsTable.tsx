'use client';

import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import type { AdminPagination } from '@/lib/api';
import type { CoffeeEvent } from '@/types';

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

const th = css({
  paddingX: '3',
  paddingY: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
});

const tr = css({
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  '&:hover': {
    background: 'gray.50',
  },
});

const td = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  verticalAlign: 'middle',
});

const tdSlug = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'gray.600',
  fontFamily: 'monospace',
  verticalAlign: 'middle',
  maxWidth: '180px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const tdDate = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
});

const tdActions = css({
  paddingX: '3',
  paddingY: '3',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
});

const tdTitle = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  verticalAlign: 'middle',
  minWidth: '200px',
});

// ─── Badge ────────────────────────────────────────────────────────────────────

const badge = cva({
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
      approved: { background: 'green.50', color: 'green.700' },
      rejected: { background: 'red.50', color: 'red.700' },
    },
  },
});

const STATUS_LABEL: Record<string, string> = {
  pending: '待審核',
  approved: '已通過',
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

const mobileRow = css({
  paddingX: '4',
  paddingY: '3',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  '&:hover': { background: 'gray.50' },
});

const mobileRowLine1 = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minWidth: 0,
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
});

const mobileRowSlug = css({
  fontFamily: 'monospace',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '120px',
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
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonTableRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className={tr}>
          <td className={td}>
            <Skeleton width="70%" height="16px" />
          </td>
          <td className={td}>
            <Skeleton width="100px" height="16px" />
          </td>
          <td className={td}>
            <Skeleton width="56px" height="20px" borderRadius="4px" />
          </td>
          <td className={td}>
            <Skeleton width="90px" height="16px" />
          </td>
          <td className={td}>
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
        <div key={i} className={mobileRow}>
          <div className={mobileRowLine1}>
            <Skeleton width="48px" height="20px" borderRadius="4px" />
            <Skeleton width="60%" height="16px" />
          </div>
          <div className={mobileRowLine2}>
            <Skeleton width="80px" height="14px" />
            <Skeleton width="100px" height="14px" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── EventsTable ──────────────────────────────────────────────────────────────

interface EventsTableProps {
  events: CoffeeEvent[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  debouncedSearch: string;
  onClearSearch: () => void;
  onDelete: (event: CoffeeEvent) => void;
  refetch: () => void;
  pagination: AdminPagination | undefined;
  onPageChange: (page: number) => void;
}

export default function EventsTable({
  events,
  isLoading,
  isError,
  emptyMessage,
  debouncedSearch,
  onClearSearch,
  onDelete,
  refetch,
  pagination,
  onPageChange,
}: EventsTableProps) {
  const router = useRouter();

  return (
    <>
      <div className={tableWrapper}>
        {/* Desktop table */}
        <table className={table} aria-label="活動列表">
          <thead className={thead}>
            <tr>
              <th className={th} style={{ minWidth: '200px' }}>
                活動名稱
              </th>
              <th className={th} style={{ width: '180px' }}>
                Slug
              </th>
              <th className={th} style={{ width: '100px' }}>
                狀態
              </th>
              <th className={th} style={{ width: '140px' }}>
                建立時間
              </th>
              <th className={th} style={{ width: '120px' }}>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonTableRows />}
            {!isLoading &&
              !isError &&
              events.map((event) => (
                <tr key={event.id} className={tr}>
                  <td className={tdTitle}>{event.title}</td>
                  <td className={tdSlug}>{event.slug ?? '—'}</td>
                  <td className={td}>
                    <span className={badge({ status: event.status })}>
                      {STATUS_LABEL[event.status] ?? event.status}
                    </span>
                  </td>
                  <td className={tdDate}>{formatDate(event.createdAt)}</td>
                  <td className={tdActions}>
                    <div className={css({ display: 'flex', gap: '1', alignItems: 'center' })}>
                      <button
                        type="button"
                        className={actionBtnText({ variant: 'ghost' })}
                        onClick={() => router.push(`/admin-new/events/${event.id}/edit`)}
                        aria-label={`編輯 ${event.title}`}
                      >
                        <PencilIcon aria-hidden="true" />
                        編輯
                      </button>
                      <button
                        type="button"
                        className={actionBtnText({ variant: 'destructive' })}
                        onClick={() => onDelete(event)}
                        aria-label={`刪除 ${event.title}`}
                      >
                        <TrashIcon aria-hidden="true" />
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Mobile list */}
        <div className={mobileList} aria-label="活動列表">
          {isLoading && <SkeletonMobileRows />}
          {!isLoading &&
            !isError &&
            events.map((event) => (
              <div key={event.id} className={mobileRow}>
                <div className={mobileRowLine1}>
                  <span className={badge({ status: event.status })}>
                    {STATUS_LABEL[event.status] ?? event.status}
                  </span>
                  <span className={mobileRowTitle}>{event.title}</span>
                  <div className={mobileRowActions}>
                    <button
                      type="button"
                      className={actionBtn({ variant: 'ghost' })}
                      onClick={() => router.push(`/admin-new/events/${event.id}/edit`)}
                      aria-label={`編輯 ${event.title}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={actionBtn({ variant: 'destructive' })}
                      onClick={() => onDelete(event)}
                      aria-label={`刪除 ${event.title}`}
                    >
                      <TrashIcon aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className={mobileRowLine2}>
                  <span className={mobileRowSlug}>{event.slug ?? '—'}</span>
                  <span>·</span>
                  <span>{formatDate(event.createdAt)}</span>
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
        {!isLoading && !isError && events.length === 0 && (
          <div className={stateBox}>
            <span>{emptyMessage}</span>
            {debouncedSearch && (
              <button className={retryBtn} onClick={onClearSearch} type="button">
                清除搜尋
              </button>
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
