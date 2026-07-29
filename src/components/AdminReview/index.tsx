'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { css, cva } from '@/styled-system/css';
import type { Artist, CoffeeEvent } from '@/types';
import AdminSidebar from '@/components/admin-new/AdminSidebar';
import Skeleton from '@/components/ui/Skeleton';
import ReviewCard from './components/ReviewCard';
import ReviewDialog from './components/ReviewDialog';
import BatchGroupNameDialog from './components/BatchGroupNameDialog';
import ArtistEditDialog from './components/ArtistEditDialog';
import EventPreviewDialog from './components/EventPreviewDialog';
import { reviewButton } from './components/reviewButtonStyles';
import useAdminReview from './hook/useAdminReview';

type DialogState =
  | { kind: 'reject'; item: Artist | CoffeeEvent | 'batch' }
  | { kind: 'groups'; item: Artist }
  | { kind: 'batch-groups' }
  | { kind: 'edit'; item: Artist }
  | { kind: 'preview'; item: CoffeeEvent }
  | null;

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  background: 'gray.50',
  paddingTop: '70px',
  color: 'color.text.primary',
});

const mainContent = css({
  minWidth: 0,
  flex: 1,
  paddingX: '4',
  paddingY: '8',
  md: { paddingX: '8' },
});

const contentInner = css({
  marginX: 'auto',
  maxWidth: '1152px',
});

const backLink = css({
  marginBottom: '3',
  display: 'inline-flex',
  minHeight: '44px',
  alignItems: 'center',
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'color.text.secondary',
  '&:hover': { color: 'color.primary' },
  md: { display: 'none' },
});

const headerSection = css({ marginBottom: '6' });

const eyebrowText = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'color.primary',
});

const pageTitle = css({
  marginTop: '1',
  textStyle: 'h1',
  color: 'color.text.primary',
});

const pageDesc = css({
  marginTop: '2',
  fontSize: 'sm',
  color: 'color.text.secondary',
});

const tabList = css({
  marginBottom: '6',
  display: 'inline-flex',
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  padding: '1',
  boxShadow: 'shadow.sm',
});

const tabButton = cva({
  base: {
    minHeight: '44px',
    borderRadius: 'radius.lg',
    paddingX: '5',
    fontSize: 'sm',
    fontWeight: 'semibold',
    transition: 'background 0.15s ease, color 0.15s ease',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
  },
  variants: {
    active: {
      true: { background: 'gray.700', color: 'white' },
      false: {
        color: 'color.text.secondary',
        '&:hover': { background: 'gray.100' },
      },
    },
  },
});

const bulkActionsBar = css({
  marginBottom: '5',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  paddingX: '4',
  paddingY: '3',
});

const selectAllLabel = css({
  display: 'flex',
  minHeight: '44px',
  alignItems: 'center',
  gap: '3',
  fontSize: 'sm',
  fontWeight: 'medium',
  cursor: 'pointer',
});

const selectAllCheckbox = css({
  width: '20px',
  height: '20px',
  accentColor: 'color.primary',
});

const bulkButtonsRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
});

const loadingGrid = css({
  display: 'grid',
  gap: '5',
  gridTemplateColumns: '1fr',
  sm: { gridTemplateColumns: 'repeat(2, 1fr)' },
  xl: { gridTemplateColumns: 'repeat(3, 1fr)' },
});

const loadingCard = css({
  aspectRatio: '4 / 3',
});

const errorBox = css({
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'red.200',
  background: 'white',
  padding: '8',
  textAlign: 'center',
});

const errorTitle = css({
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const retryButton = css({
  marginTop: '4',
  minHeight: '44px',
  borderRadius: 'radius.xl',
  background: 'gray.700',
  paddingX: '5',
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: 'white',
  cursor: 'pointer',
  border: 'none',
});

const emptyBox = css({
  borderRadius: 'radius.xl',
  border: '1px dashed',
  borderColor: 'color.border.medium',
  background: 'white',
  paddingX: '6',
  paddingY: '16',
  textAlign: 'center',
});

const emptyTitle = css({
  fontSize: 'lg',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const emptyDesc = css({
  marginTop: '2',
  fontSize: 'sm',
  color: 'color.text.secondary',
});

const itemsGrid = css({
  display: 'grid',
  gap: '5',
  gridTemplateColumns: '1fr',
  sm: { gridTemplateColumns: 'repeat(2, 1fr)' },
  xl: { gridTemplateColumns: 'repeat(3, 1fr)' },
});

export default function AdminReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'events' ? 'events' : 'artists';
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>(null);
  const { artists, events, artistMutation, editArtistMutation, eventMutation } =
    useAdminReview(tab);
  const items = tab === 'artists' ? (artists.data ?? []) : (events.data ?? []);
  const loading = tab === 'artists' ? artists.isLoading : events.isLoading;
  const error = tab === 'artists' ? artists.isError : events.isError;
  const busy = artistMutation.isPending || eventMutation.isPending;
  const batchBusy = busy;
  const rejectItem = dialog?.kind === 'reject' ? dialog.item : null;
  // 只鎖定「正在被目前 mutation 處理」的那幾筆項目，其餘未選中的卡片仍可操作。
  // mutation.variables 是 react-query 內建、當下呼叫 mutate() 時傳入的參數，
  // isPending 時即代表目前正在處理的項目 id，不需另外自建狀態管理。
  const busyArtistIds = new Set(
    artistMutation.isPending
      ? (artistMutation.variables ?? []).map((update) => update.artistId)
      : []
  );
  const busyEventIds = new Set(
    eventMutation.isPending ? (eventMutation.variables ?? []).map((update) => update.eventId) : []
  );

  const changeTab = (next: 'artists' | 'events') => {
    setSelected(new Set());
    router.replace(`?tab=${next}`, { scroll: false });
  };
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const finish = () => {
    setDialog(null);
    setSelected(new Set());
  };
  const deselect = (id: string) =>
    setSelected((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });

  return (
    <div className={pageWrapper}>
      <AdminSidebar />
      <main className={mainContent}>
        <div className={contentInner}>
          <Link href="/admin-new" className={backLink}>
            ← 管理後台
          </Link>
          <div className={headerSection}>
            <p className={eyebrowText}>內容審核</p>
            <h1 className={pageTitle}>待審核</h1>
            <p className={pageDesc}>確認投稿內容後，通過或退回給投稿者。</p>
          </div>
          <div role="tablist" aria-label="審核類型" className={tabList}>
            {(['artists', 'events'] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                onClick={() => changeTab(value)}
                className={tabButton({ active: tab === value })}
              >
                {value === 'artists' ? '待審藝人' : '待審生咖'}
              </button>
            ))}
          </div>
          {!loading && !error && items.length > 0 && (
            <div className={bulkActionsBar}>
              <label className={selectAllLabel}>
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={selected.size === items.length}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked ? new Set(items.map(({ id }) => id)) : new Set()
                    )
                  }
                  className={selectAllCheckbox}
                />
                全選（{selected.size}/{items.length}）
              </label>
              {selected.size > 0 && (
                <div className={bulkButtonsRow}>
                  <button
                    type="button"
                    disabled={busy}
                    className={reviewButton({ kind: 'approve' })}
                    onClick={() =>
                      tab === 'artists'
                        ? setDialog({ kind: 'batch-groups' })
                        : eventMutation.mutate(
                            Array.from(selected).map((eventId) => ({
                              eventId,
                              status: 'approved',
                            })),
                            { onSuccess: finish }
                          )
                    }
                  >
                    批次通過
                  </button>
                  {tab === 'artists' && (
                    <button
                      type="button"
                      disabled={busy}
                      className={reviewButton({ kind: 'exists' })}
                      onClick={() =>
                        artistMutation.mutate(
                          Array.from(selected).map((artistId) => ({
                            artistId,
                            status: 'exists',
                            reason: '藝人已存在',
                          })),
                          { onSuccess: finish }
                        )
                      }
                    >
                      標記已存在
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    className={reviewButton({ kind: 'reject' })}
                    onClick={() => setDialog({ kind: 'reject', item: 'batch' })}
                  >
                    批次拒絕
                  </button>
                </div>
              )}
            </div>
          )}
          {loading && (
            <div className={loadingGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={loadingCard}
                  width="100%"
                  height="auto"
                  borderRadius="12px"
                />
              ))}
            </div>
          )}
          {error && (
            <div role="alert" className={errorBox}>
              <p className={errorTitle}>載入待審資料失敗</p>
              <button
                type="button"
                onClick={() => (tab === 'artists' ? artists.refetch() : events.refetch())}
                className={retryButton}
              >
                重試
              </button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className={emptyBox}>
              <h2 className={emptyTitle}>沒有待審核{tab === 'artists' ? '藝人' : '生咖'}</h2>
              <p className={emptyDesc}>所有投稿都已處理完成。</p>
            </div>
          )}
          {!loading && !error && (
            <div className={itemsGrid}>
              {items.map((item) => (
                <ReviewCard
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  busy={tab === 'artists' ? busyArtistIds.has(item.id) : busyEventIds.has(item.id)}
                  onSelect={(checked) => toggle(item.id, checked)}
                  onEdit={'stageName' in item ? () => setDialog({ kind: 'edit', item }) : undefined}
                  onPreview={
                    'title' in item ? () => setDialog({ kind: 'preview', item }) : undefined
                  }
                  onApprove={() =>
                    'stageName' in item
                      ? setDialog({ kind: 'groups', item })
                      : eventMutation.mutate([{ eventId: item.id, status: 'approved' }], {
                          onSuccess: () => deselect(item.id),
                        })
                  }
                  onExists={
                    'stageName' in item
                      ? () =>
                          artistMutation.mutate(
                            [{ artistId: item.id, status: 'exists', reason: '藝人已存在' }],
                            { onSuccess: () => deselect(item.id) }
                          )
                      : undefined
                  }
                  onReject={() => setDialog({ kind: 'reject', item })}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <ReviewDialog
        open={dialog?.kind === 'reject'}
        kind="reject"
        title="拒絕投稿"
        description={rejectItem === 'batch' ? `將拒絕選取的 ${selected.size} 筆投稿` : undefined}
        busy={busy}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => {
          if (tab === 'artists')
            artistMutation.mutate(
              (rejectItem === 'batch' ? Array.from(selected) : [(rejectItem as Artist).id]).map(
                (artistId) => ({ artistId, status: 'rejected', reason: reason as string })
              ),
              { onSuccess: finish }
            );
          else
            eventMutation.mutate(
              (rejectItem === 'batch'
                ? Array.from(selected)
                : [(rejectItem as CoffeeEvent).id]
              ).map((eventId) => ({ eventId, status: 'rejected', reason: reason as string })),
              { onSuccess: finish }
            );
        }}
      />
      <ReviewDialog
        open={dialog?.kind === 'groups'}
        kind="groups"
        title="設定團名"
        initialValues={dialog?.kind === 'groups' ? dialog.item.groupNames : []}
        busy={busy}
        onClose={() => setDialog(null)}
        onConfirm={(groups) =>
          artistMutation.mutate(
            [
              {
                artistId: (dialog as Extract<DialogState, { kind: 'groups' }>).item.id,
                status: 'approved',
                groupNames: groups as string[],
              },
            ],
            { onSuccess: finish }
          )
        }
      />
      {dialog?.kind === 'batch-groups' && (
        <BatchGroupNameDialog
          artists={(artists.data ?? []).filter(({ id }) => selected.has(id))}
          busy={batchBusy}
          onClose={() => setDialog(null)}
          onConfirm={(values) =>
            artistMutation.mutate(
              Array.from(selected).map((artistId) => ({
                artistId,
                status: 'approved',
                groupNames: (
                  values[artistId] ??
                  artists.data?.find(({ id }) => id === artistId)?.groupNames?.join('、') ??
                  ''
                )
                  .split('、')
                  .map((name) => name.trim())
                  .filter(Boolean),
              })),
              { onSuccess: finish }
            )
          }
        />
      )}
      {dialog?.kind === 'edit' && (
        <ArtistEditDialog
          artist={dialog.item}
          busy={editArtistMutation.isPending}
          onClose={() => setDialog(null)}
          onSave={(data) =>
            editArtistMutation.mutate(
              { artistId: dialog.item.id, data },
              { onSuccess: () => setDialog(null) }
            )
          }
        />
      )}
      {dialog?.kind === 'preview' && (
        <EventPreviewDialog event={dialog.item} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
