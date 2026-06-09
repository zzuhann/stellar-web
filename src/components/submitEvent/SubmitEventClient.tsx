'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { css } from '@/styled-system/css';
import EventSubmissionForm from '@/components/submitEvent/EventSubmissionForm';
import showToast from '@/lib/toast';
import Loading from '@/components/Loading';
import useEventDetail from './hooks/useEventDetail';

const mainContent = css({
  maxWidth: '1200px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '4',
  paddingBottom: '10',
  '@media (min-width: 768px)': {
    paddingTop: '25',
    paddingX: '6',
    paddingBottom: '15',
  },
});

export default function SubmitEventClient() {
  const { user, loading, authModalOpen, toggleAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editEventId = searchParams.get('edit');
  const copyEventId = searchParams.get('copy');
  const isEditMode = !!editEventId;
  const isCopyMode = !!copyEventId;

  // 編輯或複製模式下取得活動資料
  const eventId = editEventId || copyEventId;
  const { data: existingEvent, isLoading: loadingEvent } = useEventDetail(eventId ?? '');

  const openedModalRef = useRef(false);
  const prevModalOpenRef = useRef(false);

  // Open auth modal when unauthenticated; check !authModalOpen to avoid toggling it closed
  useEffect(() => {
    if (!loading && !user && !authModalOpen) {
      openedModalRef.current = true;
      toggleAuthModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Reset ref after successful login
  useEffect(() => {
    if (user) openedModalRef.current = false;
  }, [user]);

  // Redirect home only when modal transitions from open → closed without logging in
  useEffect(() => {
    const wasOpen = prevModalOpenRef.current;
    prevModalOpenRef.current = authModalOpen;
    if (openedModalRef.current && wasOpen && !authModalOpen && !user) {
      router.push('/');
    }
  }, [authModalOpen, user, router]);

  useEffect(() => {
    if (loadingEvent || loading) return;
    if (!user) return;
    if (isEditMode || isCopyMode) {
      if (!existingEvent) {
        showToast.warning('活動不存在');
        router.push('/my-submissions?tab=event');
        return;
      }
      if (existingEvent.createdBy !== user?.uid) {
        showToast.warning(isCopyMode ? '權限不足，無法複製' : '權限不足，無法編輯');
        router.push('/my-submissions?tab=event');
        return;
      }
    }
  }, [isEditMode, isCopyMode, existingEvent, router, user, loadingEvent, loading]);

  const isLoading = loading || (eventId && loadingEvent);

  if (isLoading) {
    return <Loading description="載入中..." style={{ height: '100vh' }} />;
  }

  if (!user) {
    return null;
  }

  const mode = editEventId ? 'edit' : copyEventId ? 'copy' : 'create';

  return (
    <main className={mainContent}>
      <EventSubmissionForm
        mode={mode}
        existingEvent={existingEvent || undefined}
        onSuccess={() => router.push('/my-submissions?tab=event')}
        onCancel={
          editEventId || copyEventId
            ? () => router.push('/my-submissions?tab=event')
            : () => router.back()
        }
      />
    </main>
  );
}
