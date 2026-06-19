'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { useQueryState, parseAsInt } from '@/hooks/useQueryState';
import { useDebounce } from '@/hooks/useDebounce';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import { adminApi, eventsApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import Skeleton from '@/components/ui/Skeleton';
import ModalOverlay from '@/components/ui/ModalOverlay';
import type { CoffeeEvent } from '@/types';

// ─── Layout ───────────────────────────────────────────────────────────────────

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  background: 'color.background.primary',
});

const sidebar = css({
  display: 'none',
  width: '200px',
  flexShrink: 0,
  borderRight: '1px solid',
  borderRightColor: 'color.border.light',
  background: 'gray.50',
  flexDirection: 'column',
  md: {
    display: 'flex',
  },
});

const sidebarTitle = css({
  display: 'block',
  paddingX: '5',
  paddingY: '5',
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  textDecoration: 'none',
  '&:hover': {
    color: 'color.primary',
  },
});

const sidebarNav = css({
  display: 'flex',
  flexDirection: 'column',
  paddingY: '2',
});

const sidebarItem = cva({
  base: {
    display: 'block',
    paddingX: '5',
    paddingY: '2.5',
    textStyle: 'bodySmall',
    color: 'color.text.primary',
    textDecoration: 'none',
    transition: 'background 0.15s ease',
    borderLeft: '3px solid transparent',
    '&:hover': {
      background: 'gray.100',
    },
  },
  variants: {
    active: {
      true: {
        background: 'stellarBlue.50',
        borderLeftColor: 'stellarBlue.500',
        color: 'stellarBlue.500',
        fontWeight: 'semibold',
      },
    },
    disabled: {
      true: {
        color: 'color.text.disabled',
        cursor: 'not-allowed',
        '&:hover': {
          background: 'transparent',
        },
      },
    },
  },
});

const mainContent = css({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
});

// ─── Top bar ──────────────────────────────────────────────────────────────────

const topBar = css({
  paddingX: '4',
  paddingY: '4',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  md: {
    paddingX: '6',
    paddingY: '5',
  },
});

const pageTitle = css({
  textStyle: 'h3',
  color: 'color.text.primary',
  margin: 0,
});

const controlRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  flexWrap: 'wrap',
});

const searchWrapper = css({
  position: 'relative',
  flex: 1,
  minWidth: '160px',
  maxWidth: '320px',
});

const searchIcon = css({
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '16px',
  height: '16px',
  color: 'color.text.secondary',
  pointerEvents: 'none',
});

const searchInputStyle = css({
  width: '100%',
  height: '36px',
  paddingLeft: '32px',
  paddingRight: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  '&::placeholder': {
    color: 'color.text.disabled',
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
  },
});

// ─── Dropdown ─────────────────────────────────────────────────────────────────

const dropdownContainer = css({ position: 'relative' });

const dropdownTrigger = css({
  height: '36px',
  paddingY: '0',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  textStyle: 'bodySmall',
  minWidth: '100px',
  '&:hover': {
    borderColor: 'color.border.medium',
  },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  minWidth: '100%',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
  overflow: 'hidden',
});

const dropdownOption = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingX: '3',
    paddingY: '2',
    textStyle: 'bodySmall',
    color: 'color.text.primary',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    '&:hover': {
      background: 'color.background.secondary',
    },
  },
  variants: {
    selected: {
      true: {
        color: 'color.primary',
        fontWeight: 'semibold',
      },
    },
  },
});

// ─── Table ────────────────────────────────────────────────────────────────────

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

const tdSubmitter = css({
  paddingX: '3',
  paddingY: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  verticalAlign: 'middle',
  maxWidth: '140px',
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
      pending: {
        background: 'amber.50',
        color: 'amber.600',
      },
      approved: {
        background: 'green.50',
        color: 'green.700',
      },
      rejected: {
        background: 'red.50',
        color: 'red.700',
      },
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
    '& svg': {
      width: '15px',
      height: '15px',
    },
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
        '&:hover': {
          background: 'red.50',
          borderColor: 'red.500',
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
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
    '& svg': {
      width: '13px',
      height: '13px',
    },
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
        '&:hover': {
          background: 'red.50',
          borderColor: 'red.500',
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      },
    },
  },
});

// ─── Mobile list ──────────────────────────────────────────────────────────────

const mobileList = css({
  display: 'flex',
  flexDirection: 'column',
  md: {
    display: 'none',
  },
});

const mobileRow = css({
  paddingX: '4',
  paddingY: '3',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  '&:hover': {
    background: 'gray.50',
  },
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

// ─── State / Pagination ───────────────────────────────────────────────────────

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
  '&:hover': {
    background: 'color.background.secondary',
  },
});

const paginationBar = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '4',
  paddingY: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  md: {
    paddingX: '6',
  },
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
    '&:hover:not(:disabled)': {
      background: 'color.background.secondary',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
});

// ─── Delete dialog ────────────────────────────────────────────────────────────

const dialogBox = css({
  background: 'white',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  maxWidth: '420px',
  width: '100%',
  overflow: 'hidden',
});

const dialogHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '5',
  paddingTop: '5',
  paddingBottom: '3',
});

const dialogTitle = css({
  textStyle: 'h4',
  color: 'color.text.primary',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const dialogCloseBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '1',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
});

const dialogBody = css({
  paddingX: '5',
  paddingBottom: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const dialogFooter = css({
  display: 'flex',
  gap: '2',
  paddingX: '5',
  paddingBottom: '5',
  paddingTop: '2',
});

const dialogBtn = cva({
  base: {
    flex: 1,
    paddingY: '2.5',
    paddingX: '4',
    borderRadius: 'radius.md',
    border: '1px solid',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    transition: 'background 0.15s ease',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      cancel: {
        background: 'white',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': {
          background: 'color.background.secondary',
        },
      },
      destructive: {
        background: 'red.600',
        borderColor: 'red.600',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: 'red.700',
          borderColor: 'red.700',
        },
      },
      close: {
        background: 'white',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': {
          background: 'color.background.secondary',
        },
      },
    },
  },
});

const spinner = css({
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTopColor: 'white',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
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

function formatSubmitter(createdBy: string): string {
  if (createdBy.includes('@')) return createdBy;
  return createdBy.slice(0, 8);
}

const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'pending', label: '待審核' },
  { value: 'approved', label: '已通過' },
  { value: 'rejected', label: '已拒絕' },
];

const SIDEBAR_ITEMS = [
  { label: '活動', href: '/admin-new/events', active: true, disabled: false },
  { label: '藝人', href: '/admin-new/artists', active: false, disabled: false },
  { label: '待審核', href: '#', active: false, disabled: true },
  { label: '場地', href: '#', active: false, disabled: true },
];

// ─── Delete Dialog ─────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  event: CoffeeEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

function DeleteDialog({ event, onClose, onSuccess }: DeleteDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      onSuccess();
    },
    onError: () => {
      setErrorMessage('刪除失敗，請稍後再試。');
    },
  });

  const isError = errorMessage !== null;
  const isLoading = deleteMutation.isPending;

  function handleClose() {
    if (!isLoading) {
      setErrorMessage(null);
      deleteMutation.reset();
      onClose();
    }
  }

  if (!event) return null;

  return (
    <ModalOverlay isOpen zIndex={50} padding="16px">
      <div
        className={dialogBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className={dialogHeader}>
          <h3 id="delete-dialog-title" className={dialogTitle}>
            <ExclamationTriangleIcon
              style={{ width: '20px', height: '20px', color: 'var(--colors-amber-500)' }}
              aria-hidden="true"
            />
            {isError ? '刪除失敗' : '確認刪除'}
          </h3>
          <button className={dialogCloseBtn} onClick={handleClose} aria-label="關閉" type="button">
            <XMarkIcon width={20} height={20} aria-hidden="true" />
          </button>
        </div>
        <div className={dialogBody}>
          {isError ? (
            <p>{errorMessage}</p>
          ) : (
            <p>確定刪除活動「{event.title}」？此操作無法復原，所有使用者的收藏記錄也將一併刪除。</p>
          )}
        </div>
        <div className={dialogFooter}>
          {isError ? (
            <button className={dialogBtn({ variant: 'close' })} onClick={handleClose} type="button">
              關閉
            </button>
          ) : (
            <>
              <button
                className={dialogBtn({ variant: 'cancel' })}
                onClick={handleClose}
                disabled={isLoading}
                type="button"
              >
                取消
              </button>
              <button
                className={dialogBtn({ variant: 'destructive' })}
                onClick={() => deleteMutation.mutate(event.id)}
                disabled={isLoading}
                type="button"
              >
                {isLoading && <div className={spinner} aria-hidden="true" />}
                確認刪除
              </button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────

interface StatusDropdownProps {
  value: string;
  onChange: (v: string) => void;
}

function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0];

  return (
    <div ref={ref} className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected.label}</span>
        <ChevronDownIcon
          className={css({
            width: '12px',
            height: '12px',
            transition: 'transform 0.15s ease',
            ...(open ? { transform: 'rotate(180deg)' } : {}),
          })}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className={dropdownMenu} role="listbox">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={dropdownOption({ selected: value === opt.value })}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

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
            <Skeleton width="80%" height="16px" />
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

// ─── Inner page (needs QueryStateProvider) ────────────────────────────────────

function AdminEventsInner() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useQueryState('status', { defaultValue: '' });
  const [page, setPage] = useQueryState('page', { parse: parseAsInt, defaultValue: 1 });

  const debouncedSearch = useDebounce(searchInput, 500);

  const [deleteTarget, setDeleteTarget] = useState<CoffeeEvent | null>(null);

  const params = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page: page ?? 1,
    limit: 20,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKey.adminEvents(params),
    queryFn: () => adminApi.getEvents(params).then((r) => r.data),
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStatusChange(v: string) {
    setStatusFilter(v || null);
    setPage(1);
  }

  const emptyMessage = debouncedSearch
    ? `找不到符合「${debouncedSearch}」的活動`
    : '目前沒有任何活動';

  return (
    <div className={pageWrapper}>
      {/* Sidebar */}
      <aside className={sidebar} aria-label="管理後台導航">
        <Link href="/admin-new" className={sidebarTitle}>
          管理後台
        </Link>
        <nav className={sidebarNav}>
          {SIDEBAR_ITEMS.map((item) =>
            item.disabled ? (
              <span
                key={item.label}
                className={sidebarItem({ disabled: true })}
                aria-disabled="true"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={sidebarItem({ active: item.active })}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className={mainContent}>
        {/* Top bar */}
        <div className={topBar}>
          <h1 className={pageTitle}>活動列表</h1>
          <div className={controlRow}>
            <div className={searchWrapper}>
              <MagnifyingGlassIcon className={searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={searchInputStyle}
                placeholder="搜尋活動名稱..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                aria-label="搜尋活動"
              />
            </div>
            <StatusDropdown value={statusFilter ?? ''} onChange={handleStatusChange} />
          </div>
        </div>

        {/* Table wrapper */}
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
                  投稿者
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
                    <td className={tdSubmitter}>{formatSubmitter(event.createdBy)}</td>
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
                          onClick={() => setDeleteTarget(event)}
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
                        onClick={() => setDeleteTarget(event)}
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
                <button className={retryBtn} onClick={() => setSearchInput('')} type="button">
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
                onClick={() => handlePageChange(pagination.page - 1)}
                type="button"
              >
                上一頁
              </button>
              <button
                className={paginationBtn()}
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                type="button"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          event={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

import { Suspense } from 'react';

export default function AdminEventsPage() {
  return (
    <Suspense>
      <QueryStateProvider>
        <AdminEventsInner />
      </QueryStateProvider>
    </Suspense>
  );
}
