'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { css } from '@/styled-system/css';
import ArtistSubmissionForm from '@/components/forms/ArtistSubmissionForm';
import { showToast } from '@/lib/toast';
import Loading from '@/components/Loading';

const mainContent = css({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '100px 16px 40px',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

const loadingContainer = css({
  minHeight: '100vh',
  background: 'color.background.secondary',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const loadingContent = css({
  textAlign: 'center',
});

const loadingText = css({
  color: 'color.text.secondary',
  fontSize: '14px',
  margin: '0',
});

export default function SubmitArtistClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  // 取得要編輯的藝人資料
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
      showToast.warning('請先登入');
      router.push('/');
    }
  }, [user, loading, router]);

  // 檢查編輯模式下的藝人狀態
  useEffect(() => {
    if (artistLoading || loading) return;
    if (isEditMode) {
      if (!existingArtist) {
        showToast.warning('偶像不存在');
        router.push('/my-submissions?tab=artist');
        return;
      }

      // 只有 rejected 狀態可以編輯
      if (existingArtist.status !== 'rejected') {
        const statusText =
          {
            pending: '審核中',
            approved: '已通過',
            exists: '已存在',
          }[existingArtist.status] || '無法編輯';

        showToast.warning(`此偶像目前狀態為「${statusText}」，無法編輯`);
        router.push('/my-submissions?tab=artist');
      }
      if (existingArtist.createdBy !== user?.uid) {
        showToast.warning('權限不足，無法編輯');
        router.push('/my-submissions?tab=artist');
      }
    }
  }, [isEditMode, existingArtist, router, user, artistLoading, loading]);

  const handleSuccess = () => {
    router.push('/my-submissions?tab=artist');
  };

  const handleCancel = () => {
    router.push('/my-submissions?tab=artist');
  };

  const isLoading = loading || (isEditMode && artistLoading);

  if (isLoading) {
    return (
      <Loading
        description={isEditMode ? '載入偶像資料中...' : '載入中...'}
        style={{ height: '100vh' }}
      />
    );
  }

  if (!user) {
    return null;
  }

  if (isEditMode && error) {
    return (
      <main className={mainContent}>
        <div className={loadingContainer}>
          <div className={loadingContent}>
            <p className={loadingText}>載入偶像資料失敗，請重試</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={mainContent}>
      <ArtistSubmissionForm
        mode={isEditMode ? 'edit' : 'create'}
        existingArtist={existingArtist}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </main>
  );
}
