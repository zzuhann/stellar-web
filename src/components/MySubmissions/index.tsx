'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

import { CoffeeEvent } from '@/types';

import EventPreviewModal from '@/components/events/EventPreviewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { showToast } from '@/lib/toast';
import Loading from '../Loading';
import { css } from '@/styled-system/css';
import ArtistSubmissions from './components/ArtistSubmissions';
import EventSubmissions from './components/EventSubmissions';
import TabNav from './components/TabNav';
import { useQueryState, parseAsInt } from '@/hooks/useQueryState';
import { useQueryStateContext } from '@/hooks/useQueryStateContext';
import { useMySubmittedArtists, useMySubmittedEvents } from './hooks/useUserSubmissions';
import useDeleteEventMutation from './hooks/useDeleteEventMutation';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '600px',
  margin: '0 auto',
  padding: '100px 16px 40px',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

const contentWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const parsePage = (raw: string): number => {
  const n = parseAsInt(raw);
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

function MySubmissions() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { mergeUpdates } = useQueryStateContext();

  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'event' as 'artist' | 'event',
    parse: (value) => {
      return value === 'artist' || value === 'event' ? value : 'event';
    },
  });

  const [page, setPage] = useQueryState('page', {
    defaultValue: 1,
    parse: parsePage,
  });

  const handleTabChange = (tab: 'artist' | 'event') => {
    // 必須合併更新：連續兩次 setState 各會 replace，第二下讀到的 searchParams 仍是舊的，會蓋掉 tab
    mergeUpdates(() => {
      setActiveTab(tab);
      setPage(1);
    });
  };

  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    event: CoffeeEvent | null;
  }>({ isOpen: false, event: null });

  const eventsQuery = useMySubmittedEvents(page, !!user && activeTab === 'event');
  const artistsQuery = useMySubmittedArtists(page, !!user && activeTab === 'artist');

  const deleteEventMutation = useDeleteEventMutation();

  useEffect(() => {
    const payload = activeTab === 'event' ? eventsQuery.data : artistsQuery.data;
    if (!payload) return;
    if (payload.pagination.page !== page) {
      setPage(payload.pagination.page);
    }
  }, [activeTab, artistsQuery.data, eventsQuery.data, page, setPage]);

  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看投稿狀態');
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleConfirmDelete = () => {
    if (deleteConfirmModal.event) {
      deleteEventMutation.mutate(deleteConfirmModal.event.id);
      setDeleteConfirmModal({ isOpen: false, event: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, event: null });
  };

  const isLoading =
    authLoading || (activeTab === 'event' ? eventsQuery.isLoading : artistsQuery.isLoading);

  if (!user) {
    return null;
  }

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={contentWrapper}>
          <TabNav activeTab={activeTab} handleTabChange={handleTabChange} />

          {isLoading && <Loading description="載入中..." />}

          {!isLoading && activeTab === 'artist' && artistsQuery.data && (
            <ArtistSubmissions
              artists={artistsQuery.data.artists}
              summary={artistsQuery.data.summary}
              pagination={artistsQuery.data.pagination}
              currentPage={page}
              onPageChange={setPage}
            />
          )}

          {!isLoading && activeTab === 'event' && eventsQuery.data && (
            <EventSubmissions
              events={eventsQuery.data.events}
              summary={eventsQuery.data.summary}
              pagination={eventsQuery.data.pagination}
              currentPage={page}
              onPageChange={setPage}
              deleteEventMutation={deleteEventMutation}
              setPreviewingEvent={setPreviewingEvent}
              setDeleteConfirmModal={setDeleteConfirmModal}
            />
          )}
        </div>
      </div>

      {previewingEvent && (
        <EventPreviewModal
          event={previewingEvent}
          isOpen={true}
          onClose={() => setPreviewingEvent(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        title="確認刪除"
        message={`確定要刪除「${deleteConfirmModal.event?.title}」嗎？此操作無法復原。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="刪除"
        cancelText="取消"
        isLoading={deleteEventMutation.isPending}
      />
    </div>
  );
}

export default MySubmissions;
