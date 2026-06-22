'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import type { AdminPagination } from '@/lib/api';
import type { Artist } from '@/types';

// ─── Table CSS ────────────────────────────────────────────────────────────────

const tableWrapper = css({
  flex: 1,
  overflowX: 'auto',
  paddingX: '4',
  paddingY: '3',
  md: { paddingX: '6' },
});

const table = css({
  width: '100%',
  borderCollapse: 'collapse',
  display: 'none',
  md: { display: 'table' },
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

const thCheckbox = css({
  paddingX: '3',
  paddingY: '2.5',
  width: '40px',
  verticalAlign: 'middle',
});

const tr = css({
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  '&:hover': { background: 'gray.50' },
});

const trSelected = css({
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  background: 'blue.50',
  '&:hover': { background: 'blue.100' },
});

const td = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  verticalAlign: 'middle',
});

const tdCheckbox = css({
  paddingX: '3',
  paddingY: '3',
  width: '40px',
  verticalAlign: 'middle',
});

const tdSlug = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'gray.600',
  fontFamily: 'monospace',
  verticalAlign: 'middle',
  maxWidth: '260px',
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

const tdName = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  verticalAlign: 'middle',
  minWidth: '120px',
});

const tdNameSecondary = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  verticalAlign: 'middle',
  minWidth: '100px',
});

// ─── Checkbox ─────────────────────────────────────────────────────────────────

const checkboxStyle = css({
  width: '16px',
  height: '16px',
  cursor: 'pointer',
  accentColor: 'color.primary',
});

// ─── Batch action bar ─────────────────────────────────────────────────────────

const batchBar = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingX: '4',
  paddingY: '2.5',
  background: 'blue.50',
  borderBottom: '1px solid',
  borderBottomColor: 'blue.200',
  md: { paddingX: '6' },
});

const batchBarText = css({
  flex: 1,
  textStyle: 'bodySmall',
  color: 'blue.700',
  fontWeight: 'semibold',
});

const batchDeleteBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'red.300',
  background: 'white',
  color: 'red.600',
  textStyle: 'caption',
  fontWeight: 'semibold',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease',
  '& svg': { width: '13px', height: '13px' },
  '&:hover': { background: 'red.50', borderColor: 'red.500' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

// ─── Confirm bar (inline) ─────────────────────────────────────────────────────

const confirmBar = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingX: '4',
  paddingY: '2.5',
  background: 'red.50',
  borderBottom: '1px solid',
  borderBottomColor: 'red.200',
  md: { paddingX: '6' },
});

const confirmBarText = css({
  flex: 1,
  textStyle: 'bodySmall',
  color: 'red.700',
  fontWeight: 'semibold',
});

const confirmBarBtns = css({
  display: 'flex',
  gap: '2',
  alignItems: 'center',
});

const cancelBtn = css({
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'caption',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary' },
});

const confirmDeleteBtn = css({
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'red.600',
  color: 'white',
  textStyle: 'caption',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:hover': { background: 'red.700' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
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
      exists: { background: 'gray.100', color: 'gray.600' },
    },
  },
});

const STATUS_LABEL: Record<string, string> = {
  pending: '待審核',
  approved: '已通過',
  rejected: '已拒絕',
  exists: '已存在',
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

const mobileRowSelected = css({
  paddingX: '4',
  paddingY: '3',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  background: 'blue.50',
  '&:hover': { background: 'blue.100' },
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
          <td className={tdCheckbox} />
          <td className={td}>
            <Skeleton width="80px" height="16px" />
          </td>
          <td className={td}>
            <Skeleton width="60px" height="16px" />
          </td>
          <td className={td}>
            <Skeleton width="60px" height="16px" />
          </td>
          <td className={td}>
            <Skeleton width="120px" height="16px" />
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

// ─── ArtistsTable ─────────────────────────────────────────────────────────────

interface ArtistsTableProps {
  artists: Artist[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  debouncedSearch: string;
  onClearSearch: () => void;
  onDelete: (artist: Artist) => void;
  onBatchDelete: (ids: string[]) => Promise<void>;
  refetch: () => void;
  pagination: AdminPagination | undefined;
  onPageChange: (page: number) => void;
}

export default function ArtistsTable({
  artists,
  isLoading,
  isError,
  emptyMessage,
  debouncedSearch,
  onClearSearch,
  onDelete,
  onBatchDelete,
  refetch,
  pagination,
  onPageChange,
}: ArtistsTableProps) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentArtistIds = useMemo(() => new Set(artists.map((a) => a.id)), [artists]);
  const validSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => currentArtistIds.has(id))),
    [selectedIds, currentArtistIds]
  );

  const isAllSelected =
    currentArtistIds.size > 0 && [...currentArtistIds].every((id) => validSelectedIds.has(id));
  const isIndeterminate =
    [...currentArtistIds].some((id) => validSelectedIds.has(id)) && !isAllSelected;

  function toggleAll() {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentArtistIds));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await onBatchDelete(Array.from(validSelectedIds));
      setSelectedIds(new Set());
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const selectedCount = validSelectedIds.size;

  return (
    <>
      {/* Batch action bar */}
      {selectedCount > 0 && !isConfirming && (
        <div className={batchBar}>
          <span className={batchBarText}>已選 {selectedCount} 筆</span>
          <button type="button" className={batchDeleteBtn} onClick={() => setIsConfirming(true)}>
            <TrashIcon aria-hidden="true" />
            刪除
          </button>
        </div>
      )}

      {/* Inline confirm bar */}
      {isConfirming && (
        <div className={confirmBar}>
          <span className={confirmBarText}>
            確定要刪除 {selectedCount} 筆藝人？此操作無法復原。
          </span>
          <div className={confirmBarBtns}>
            <button
              type="button"
              className={cancelBtn}
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
            >
              取消
            </button>
            <button
              type="button"
              className={confirmDeleteBtn}
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '刪除中...' : '確認刪除'}
            </button>
          </div>
        </div>
      )}

      <div className={tableWrapper}>
        {/* Desktop table */}
        <table className={table} aria-label="藝人列表">
          <thead className={thead}>
            <tr>
              <th className={thCheckbox}>
                <input
                  type="checkbox"
                  className={checkboxStyle}
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={toggleAll}
                  aria-label="全選"
                  disabled={isLoading || currentArtistIds.size === 0}
                />
              </th>
              <th className={th} style={{ minWidth: '120px' }}>
                藝名（英）
              </th>
              <th className={th} style={{ minWidth: '100px' }}>
                藝名（中）
              </th>
              <th className={th} style={{ minWidth: '100px' }}>
                本名
              </th>
              <th className={th} style={{ width: '260px' }}>
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
              artists.map((artist) => (
                <tr key={artist.id} className={selectedIds.has(artist.id) ? trSelected : tr}>
                  <td className={tdCheckbox}>
                    <input
                      type="checkbox"
                      className={checkboxStyle}
                      checked={selectedIds.has(artist.id)}
                      onChange={() => toggleOne(artist.id)}
                      aria-label={`選取 ${artist.stageName}`}
                    />
                  </td>
                  <td className={tdName}>{artist.stageName}</td>
                  <td className={tdNameSecondary}>{artist.stageNameZh ?? '—'}</td>
                  <td className={tdNameSecondary}>{artist.realName ?? '—'}</td>
                  <td className={tdSlug}>{artist.slug ?? '—'}</td>
                  <td className={td}>
                    <span
                      className={badge({
                        status: artist.status as 'pending' | 'approved' | 'rejected' | 'exists',
                      })}
                    >
                      {STATUS_LABEL[artist.status] ?? artist.status}
                    </span>
                  </td>
                  <td className={tdDate}>{formatDate(artist.createdAt)}</td>
                  <td className={tdActions}>
                    <div className={css({ display: 'flex', gap: '1', alignItems: 'center' })}>
                      <button
                        type="button"
                        className={actionBtnText({ variant: 'ghost' })}
                        onClick={() => router.push(`/admin-new/artists/${artist.id}/edit`)}
                        aria-label={`編輯 ${artist.stageName}`}
                      >
                        <PencilIcon aria-hidden="true" />
                        編輯
                      </button>
                      <button
                        type="button"
                        className={actionBtnText({ variant: 'destructive' })}
                        onClick={() => onDelete(artist)}
                        aria-label={`刪除 ${artist.stageName}`}
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
        <div className={mobileList} aria-label="藝人列表">
          {isLoading && <SkeletonMobileRows />}
          {!isLoading &&
            !isError &&
            artists.map((artist) => (
              <div
                key={artist.id}
                className={selectedIds.has(artist.id) ? mobileRowSelected : mobileRow}
              >
                <div className={mobileRowLine1}>
                  <input
                    type="checkbox"
                    className={checkboxStyle}
                    checked={selectedIds.has(artist.id)}
                    onChange={() => toggleOne(artist.id)}
                    aria-label={`選取 ${artist.stageName}`}
                  />
                  <span
                    className={badge({
                      status: artist.status as 'pending' | 'approved' | 'rejected' | 'exists',
                    })}
                  >
                    {STATUS_LABEL[artist.status] ?? artist.status}
                  </span>
                  <span className={mobileRowTitle}>
                    {artist.stageName}
                    {artist.stageNameZh && ` · ${artist.stageNameZh}`}
                  </span>
                  <div className={mobileRowActions}>
                    <button
                      type="button"
                      className={actionBtn({ variant: 'ghost' })}
                      onClick={() => router.push(`/admin-new/artists/${artist.id}/edit`)}
                      aria-label={`編輯 ${artist.stageName}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={actionBtn({ variant: 'destructive' })}
                      onClick={() => onDelete(artist)}
                      aria-label={`刪除 ${artist.stageName}`}
                    >
                      <TrashIcon aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className={mobileRowLine2}>
                  <span className={mobileRowSlug}>{artist.slug ?? '—'}</span>
                  <span>·</span>
                  <span>{formatDate(artist.createdAt)}</span>
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
        {!isLoading && !isError && artists.length === 0 && (
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
