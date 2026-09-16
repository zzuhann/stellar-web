'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { css } from '@/styled-system/css';
import EventSubmissionForm from '@/components/submitEvent/EventSubmissionForm';
import ApiErrorState from '@/components/ui/ApiErrorState';
import showToast from '@/lib/toast';
import Loading from '@/components/Loading';
import useEventDetail from './hooks/useEventDetail';
import { handleApiError } from '@/lib/api';

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
  const {
    data: existingEvent,
    isLoading: loadingEvent,
    isError: eventLoadError,
    error: eventError,
    refetch: refetchEvent,
  } = useEventDetail(eventId ?? '');

  const openedModalRef = useRef(false);
  const prevModalOpenRef = useRef(false);
  const wasLoggedInRef = useRef(false);

  // Open auth modal when unauthenticated; check !authModalOpen to avoid toggling it closed
  useEffect(() => {
    if (!loading && !user && !authModalOpen) {
      openedModalRef.current = true;
      toggleAuthModal();
    }
    // user intentionally omitted: this effect should only run once when auth resolves,
    // not re-run on logout (handled by wasLoggedInRef effect below)
    // authModalOpen intentionally omitted: reading it here would create a stale closure loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, toggleAuthModal]);

  // Reset ref after successful login
  useEffect(() => {
    if (user) {
      openedModalRef.current = false;
      wasLoggedInRef.current = true;
    }
  }, [user]);

  // Redirect home only when modal transitions from open → closed without logging in
  useEffect(() => {
    const wasOpen = prevModalOpenRef.current;
    prevModalOpenRef.current = authModalOpen;
    if (openedModalRef.current && wasOpen && !authModalOpen && !user) {
      router.push('/');
    }
  }, [authModalOpen, user, router]);

  // Redirect home on logout (user was logged in, then signed out)
  useEffect(() => {
    if (!loading && !user && wasLoggedInRef.current) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loadingEvent || loading) return;
    if (!user) return;
    if (isEditMode || isCopyMode) {
      if (eventLoadError) return;
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
  }, [isEditMode, isCopyMode, existingEvent, router, user, loadingEvent, loading, eventLoadError]);

  // existingEvent 已經有資料代表表單已經渲染過、使用者可能正在編輯——
  // 這時候背景重新整理失敗不能卸載表單（會銷毀使用者還沒送出的內容），
  // 只有「從來沒成功拿到過資料」（初次載入就失敗）才顯示整頁錯誤畫面。
  if (eventId && eventLoadError && !existingEvent) {
    return (
      <main className={mainContent}>
        <ApiErrorState
          message={handleApiError(eventError, '活動資料載入失敗，請稍後再試')}
          onRetry={() => refetchEvent()}
        />
      </main>
    );
  }

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
