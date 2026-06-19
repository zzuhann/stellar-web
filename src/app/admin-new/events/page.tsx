'use client';

import { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useQueryState, parseAsInt } from '@/hooks/useQueryState';
import { useDebounce } from '@/hooks/useDebounce';
import { QueryStateProvider, useQueryStateContextMergeUpdates } from '@/hooks/useQueryStateContext';
import { adminApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import AdminSidebar from '../_components/AdminSidebar';
import DeleteEventDialog from './_components/DeleteEventDialog';
import StatusDropdown from './_components/StatusDropdown';
import EventsTable from './_components/EventsTable';
import type { CoffeeEvent } from '@/types';

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

// ─── Inner page (needs QueryStateProvider) ────────────────────────────────────

function AdminEventsInner() {
  const { mergeUpdates } = useQueryStateContextMergeUpdates();

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
    mergeUpdates(() => {
      setStatusFilter(v || null);
      setPage(1);
    });
  }

  const emptyMessage = debouncedSearch
    ? `找不到符合「${debouncedSearch}」的活動`
    : '目前沒有任何活動';

  return (
    <div className={pageWrapper}>
      <AdminSidebar />

      <main className={mainContent}>
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
                  mergeUpdates(() => {
                    setPage(1);
                  });
                }}
                aria-label="搜尋活動"
              />
            </div>
            <StatusDropdown value={statusFilter ?? ''} onChange={handleStatusChange} />
          </div>
        </div>

        <EventsTable
          events={events}
          isLoading={isLoading}
          isError={isError}
          emptyMessage={emptyMessage}
          debouncedSearch={debouncedSearch}
          onClearSearch={() => setSearchInput('')}
          onDelete={setDeleteTarget}
          refetch={refetch}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>

      {deleteTarget && (
        <DeleteEventDialog
          event={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  return (
    <Suspense>
      <QueryStateProvider>
        <AdminEventsInner />
      </QueryStateProvider>
    </Suspense>
  );
}
