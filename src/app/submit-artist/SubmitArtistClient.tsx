'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import styled from 'styled-components';
import ArtistSubmissionForm from '@/components/forms/ArtistSubmissionForm';

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

export default function SubmitArtistClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  // 獲取要編輯的藝人資料
  const {
    data: existingArtist,
    isLoading: artistLoading,
    error,
  } = useQuery({
    queryKey: ['artist', editId],
    queryFn: () => artistsApi.getById(editId ?? ''),
    enabled: isEditMode,
    retry: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    router.push('/my-submissions');
  };

  const handleCancel = () => {
    router.push('/my-submissions');
  };

  if (loading || (isEditMode && artistLoading)) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>{isEditMode ? '載入偶像資料中...' : '載入中...'}</LoadingText>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (!user) {
    return null;
  }

  if (isEditMode && error) {
    return (
      <MainContent>
        <LoadingContainer>
          <LoadingContent>
            <LoadingText>載入偶像資料失敗，請重試</LoadingText>
          </LoadingContent>
        </LoadingContainer>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <ArtistSubmissionForm
        mode={isEditMode ? 'edit' : 'create'}
        existingArtist={existingArtist}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </MainContent>
  );
}
