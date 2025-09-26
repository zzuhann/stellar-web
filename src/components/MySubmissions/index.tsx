'use client';

import { useState, useEffect } from 'react';

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
import { useQueryState } from '@/hooks/useQueryState';
import useUserSubmissions from './hooks/useUserSubmissions';
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

function MySubmissions() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'event' as 'artist' | 'event',
    parse: (value) => {
      return value === 'artist' || value === 'event' ? value : 'event';
    },
  });

  const handleTabChange = (tab: 'artist' | 'event') => {
    setActiveTab(tab);
  };

  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    event: CoffeeEvent | null;
  }>({ isOpen: false, event: null });

  const { data: userSubmissions, isLoading: userSubmissionsLoading } = useUserSubmissions(!!user);

  const deleteEventMutation = useDeleteEventMutation();

  // 權限檢查
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

  if (authLoading || userSubmissionsLoading) {
    return (
      <div className={pageContainer}>
        <div className={mainContainer}>
          <Loading description="載入投稿資料中..." height="100vh" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={contentWrapper}>
          <TabNav activeTab={activeTab} handleTabChange={handleTabChange} />

          {activeTab === 'artist' && <ArtistSubmissions artists={userSubmissions?.artists ?? []} />}

          {activeTab === 'event' && userSubmissions && (
            <EventSubmissions
              events={userSubmissions.events}
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
