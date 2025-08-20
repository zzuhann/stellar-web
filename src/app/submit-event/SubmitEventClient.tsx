'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';
import EventSubmissionForm from '@/components/forms/EventSubmissionForm';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 16px 40px;

  @media (min-width: 768px) {
    padding: 100px 24px 60px;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border-light);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0;
`;

export default function SubmitEventClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editEventId = searchParams.get('edit');

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

  if (loading || (editEventId && loadingEvent)) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>載入中...</LoadingText>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainContent>
      <EventSubmissionForm
        mode={editEventId ? 'edit' : 'create'}
        existingEvent={existingEvent || undefined}
        onSuccess={() => router.push('/my-submissions?tab=event')}
        onCancel={
          editEventId ? () => router.push('/my-submissions?tab=event') : () => router.back()
        }
      />
    </MainContent>
  );
}
