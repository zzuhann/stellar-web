'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Artist, CoffeeEvent } from '@/types';
import AdminSidebar from '@/components/admin-new/AdminSidebar';
import ReviewCard from './components/ReviewCard';
import ReviewDialog from './components/ReviewDialog';
import BatchGroupNameDialog from './components/BatchGroupNameDialog';
import ArtistEditDialog from './components/ArtistEditDialog';
import EventPreviewDialog from './components/EventPreviewDialog';
import useAdminReview from './hook/useAdminReview';

type DialogState =
  | { kind: 'reject'; item: Artist | CoffeeEvent | 'batch' }
  | { kind: 'groups'; item: Artist }
  | { kind: 'batch-groups' }
  | { kind: 'edit'; item: Artist }
  | { kind: 'preview'; item: CoffeeEvent }
  | null;

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
  const batchBusy = busy && selected.size > 1;
  const rejectItem = dialog?.kind === 'reject' ? dialog.item : null;

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
    <div className="flex min-h-dvh bg-surface-muted pt-[70px] text-content">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin-new"
            className="mb-3 inline-flex min-h-11 items-center text-sm font-medium text-content-muted hover:text-brand md:hidden"
          >
            ← 管理後台
          </Link>
          <div className="mb-6">
            <p className="text-sm font-medium text-brand">內容審核</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-content">待審核</h1>
            <p className="mt-2 text-sm text-content-muted">確認投稿內容後，通過或退回給投稿者。</p>
          </div>
          <div
            role="tablist"
            aria-label="審核類型"
            className="mb-6 inline-flex rounded-stellar-xl border border-line bg-surface p-1 shadow-stellar-sm"
          >
            {(['artists', 'events'] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                onClick={() => changeTab(value)}
                className={`min-h-11 rounded-stellar-lg px-5 text-sm font-semibold transition-colors ${tab === value ? 'bg-content text-surface' : 'text-content-muted hover:bg-neutral-subtle'}`}
              >
                {value === 'artists' ? '待審藝人' : '待審生咖'}
              </button>
            ))}
          </div>
          {!loading && !error && items.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-stellar-xl border border-line bg-surface px-4 py-3">
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={selected.size === items.length}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked ? new Set(items.map(({ id }) => id)) : new Set()
                    )
                  }
                  className="size-5 accent-brand"
                />
                全選（{selected.size}/{items.length}）
              </label>
              {selected.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="review-approve-button"
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
                      className="review-exists-button"
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
                    className="review-reject-button"
                    onClick={() => setDialog({ kind: 'reject', item: 'batch' })}
                  >
                    批次拒絕
                  </button>
                </div>
              )}
            </div>
          )}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse rounded-stellar-xl bg-line motion-reduce:animate-none"
                />
              ))}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-stellar-xl border border-danger-line bg-surface p-8 text-center"
            >
              <p className="font-semibold text-content">載入待審資料失敗</p>
              <button
                type="button"
                onClick={() => (tab === 'artists' ? artists.refetch() : events.refetch())}
                className="mt-4 min-h-11 rounded-stellar-xl bg-content px-5 text-sm font-semibold text-surface"
              >
                重試
              </button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="rounded-stellar-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-content">
                沒有待審核{tab === 'artists' ? '藝人' : '生咖'}
              </h2>
              <p className="mt-2 text-sm text-content-muted">所有投稿都已處理完成。</p>
            </div>
          )}
          {!loading && !error && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <ReviewCard
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  busy={busy}
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
