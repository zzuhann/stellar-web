'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useQueryState, parseAsInt } from '@/hooks/useQueryState';
import { QueryStateProvider, useQueryStateContextMergeUpdates } from '@/hooks/useQueryStateContext';
import { adminApi, venueApi, handleApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';
import queryKey from '@/hooks/queryKey';
import AdminSidebar from '@/components/admin-new/AdminSidebar';
import StatusDropdown from '@/components/admin-new/StatusDropdown';
import VenuesTable from '@/components/admin-new/VenuesTable';
import VenueBatchActionBar, {
  type VenueBatchAction,
} from '@/components/admin-new/VenueBatchActionBar';
import VenueBatchDialog from '@/components/admin-new/VenueBatchDialog';
import DeleteVenueDialog from '@/components/admin-new/DeleteVenueDialog';
import type { Venue } from '@/types';

// ─── Layout CSS ───────────────────────────────────────────────────────────────

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  paddingTop: '70px',
  background: 'color.background.primary',
});

const mainContent = css({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
});

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

const titleRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
});

const pageTitle = css({
  textStyle: 'h3',
  color: 'color.text.primary',
  margin: 0,
});

const addBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  paddingX: '3',
  paddingY: '2',
  borderRadius: 'radius.md',
  background: 'stellarBlue.600',
  color: 'white',
  textStyle: 'caption',
  fontWeight: 'semibold',
  textDecoration: 'none',
  transition: 'background 0.15s ease',
  '&:hover': { background: 'stellarBlue.700' },
  '& svg': { width: '15px', height: '15px' },
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

// ─── Status options for venues ────────────────────────────────────────────────

const VENUE_STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'pending', label: '審核中' },
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '已下架' },
  { value: 'rejected', label: '已拒絕' },
];

// ─── Inner page ───────────────────────────────────────────────────────────────

function AdminVenuesInner() {
  const { mergeUpdates } = useQueryStateContextMergeUpdates();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useQueryState('status', { defaultValue: '' });
  const [page, setPage] = useQueryState('page', { parse: parseAsInt, defaultValue: 1 });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<VenueBatchAction | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const params = {
    search: committedSearch || undefined,
    status: statusFilter || undefined,
    page: page ?? 1,
    limit: 20,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKey.adminVenues(params),
    queryFn: () => adminApi.getVenues(params).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const venues = data?.data ?? [];
  const pagination = data?.pagination;

  // ─── Batch action mutation ─────────────────────────────────────────────────

  const batchMutation = useMutation({
    mutationFn: async (action: VenueBatchAction) => {
      const ids = Array.from(selectedIds);
      if (action === 'approve') {
        return venueApi.batchReviewVenues(ids.map((venueId) => ({ venueId, status: 'active' })));
      }
      if (action === 'reject') {
        return venueApi.batchReviewVenues(ids.map((venueId) => ({ venueId, status: 'rejected' })));
      }
      if (action === 'online') {
        return venueApi.batchStatusVenues(ids.map((venueId) => ({ venueId, status: 'active' })));
      }
      if (action === 'offline') {
        return venueApi.batchStatusVenues(ids.map((venueId) => ({ venueId, status: 'inactive' })));
      }
    },
    onSuccess: (_data, variables) => {
      const ids = Array.from(selectedIds);
      const count = ids.length;
      if (variables === 'approve') showToast.success(`已審核通過 ${count} 間場地`);
      else if (variables === 'reject') showToast.success(`已拒絕 ${count} 間場地`);
      else if (variables === 'online') showToast.success(`已上架 ${count} 間場地`);
      else if (variables === 'offline') showToast.success(`已下架 ${count} 間場地`);
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      setSelectedIds(new Set());
      setBatchAction(null);
      setBatchError(null);
    },
    onError: (err) => {
      setBatchError(handleApiError(err));
    },
  });

  // ─── Delete mutation ───────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: string) => venueApi.permanentDeleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      setDeleteTarget(null);
      setDeleteError(null);
    },
    onError: (err) => {
      setDeleteError(handleApiError(err));
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStatusChange(v: string) {
    mergeUpdates(() => {
      setStatusFilter(v || null);
      setPage(1);
    });
  }

  function handleSearchCommit() {
    setCommittedSearch(searchInput);
    mergeUpdates(() => {
      setPage(1);
    });
  }

  function handleToggleSelect(id: string) {
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

  function handleToggleSelectAll() {
    const allIds = venues.map((v) => v.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  const selectedVenues = venues.filter((v) => selectedIds.has(v.id));

  const emptyMessage = committedSearch
    ? `找不到符合「${committedSearch}」的場地`
    : '目前沒有任何場地';

  return (
    <div className={pageWrapper}>
      <AdminSidebar />

      <main className={mainContent}>
        <div className={topBar}>
          <div className={titleRow}>
            <h1 className={pageTitle}>場地列表</h1>
            <Link href="/admin-new/venues/new" className={addBtn}>
              <PlusIcon aria-hidden="true" />
              新增場地
            </Link>
          </div>
          <div className={controlRow}>
            <div className={searchWrapper}>
              <MagnifyingGlassIcon className={searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={searchInputStyle}
                placeholder="搜尋場地名稱"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
                aria-label="搜尋場地名稱"
              />
            </div>
            <StatusDropdown
              value={statusFilter ?? ''}
              onChange={handleStatusChange}
              options={VENUE_STATUS_OPTIONS}
            />
          </div>
        </div>

        <VenueBatchActionBar
          selectedVenues={selectedVenues}
          onClearSelection={() => setSelectedIds(new Set())}
          onBatchAction={(action) => setBatchAction(action)}
          isLoading={batchMutation.isPending}
        />

        <VenuesTable
          venues={venues}
          isLoading={isLoading}
          isError={isError}
          emptyMessage={emptyMessage}
          debouncedSearch={committedSearch}
          onClearSearch={() => {
            setSearchInput('');
            setCommittedSearch('');
          }}
          onDelete={(venue) => {
            setDeleteError(null);
            setDeleteTarget(venue);
          }}
          refetch={refetch}
          pagination={pagination}
          onPageChange={handlePageChange}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          isBatchLoading={batchMutation.isPending}
        />
      </main>

      <VenueBatchDialog
        action={batchAction}
        count={selectedIds.size}
        onConfirm={() => {
          if (batchAction) batchMutation.mutate(batchAction);
        }}
        onClose={() => {
          setBatchAction(null);
          setBatchError(null);
        }}
        isLoading={batchMutation.isPending}
        error={batchError}
      />

      <DeleteVenueDialog
        venue={deleteTarget}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        isLoading={deleteMutation.isPending}
        error={deleteError}
      />
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AdminVenuesPage() {
  return (
    <Suspense>
      <QueryStateProvider>
        <AdminVenuesInner />
      </QueryStateProvider>
    </Suspense>
  );
}
