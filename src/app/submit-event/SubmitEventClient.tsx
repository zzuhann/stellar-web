'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { css } from '@/styled-system/css';
import EventSubmissionForm from '@/components/forms/EventSubmissionForm';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import Loading from '@/components/Loading';

const mainContent = css({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '100px 16px 40px',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

export default function SubmitEventClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editEventId = searchParams.get('edit');
  const isEditMode = !!editEventId;

  // 如果是編輯模式，獲取活動資料
  const { data: existingEvent, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', editEventId],
    queryFn: () => eventsApi.getById(editEventId ?? ''),
    enabled: !!editEventId,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loadingEvent || loading) return;
    if (isEditMode) {
      if (!existingEvent) {
        showToast.warning('活動不存在');
        router.push('/my-submissions?tab=event');
        return;
      }
      if (existingEvent.createdBy !== user?.uid) {
        showToast.warning('權限不足，無法編輯');
        router.push('/my-submissions?tab=event');
        return;
      }
    }
  }, [isEditMode, existingEvent, router, user, loadingEvent, loading]);

  const isLoading = loading || (editEventId && loadingEvent);

  if (isLoading) {
    return <Loading description="載入中..." style={{ height: '100vh' }} />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className={mainContent}>
      <EventSubmissionForm
        mode={editEventId ? 'edit' : 'create'}
        existingEvent={existingEvent || undefined}
        onSuccess={() => router.push('/my-submissions?tab=event')}
        onCancel={
          editEventId ? () => router.push('/my-submissions?tab=event') : () => router.back()
        }
      />
    </main>
  );
}
