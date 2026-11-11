'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import { adminApi } from '@/lib/api';
import AdminSidebar from '@/components/admin-new/AdminSidebar';
import ArtistSubmissionForm from '@/components/forms/ArtistSubmissionForm';
import Loading from '@/components/Loading';

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  paddingTop: '70px',
  background: 'color.background.primary',
});

const mainContent = css({
  flex: 1,
  minWidth: 0,
  paddingX: '4',
  paddingY: '6',
  md: { paddingX: '6' },
});

const notFoundBox = css({
  paddingY: '20',
  textAlign: 'center',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

export default function EditArtistClient({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-artist-edit', id],
    queryFn: () => adminApi.getArtists({ id }).then((r) => r.data.data[0] ?? null),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const backToList = () => {
    // Admin caches are 10 min stale. Remove (not invalidate) the edit query: invalidate keeps the old data
    // while refetching, so a quick re-edit would seed the form with stale group names and write them back
    queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
    queryClient.removeQueries({ queryKey: ['admin-artist-edit', id] });
    router.push('/admin-new/artists');
  };

  return (
    <div className={pageWrapper}>
      <AdminSidebar />
      <main className={mainContent}>
        {isLoading && <Loading description="載入中..." />}
        {!isLoading && !data && <div className={notFoundBox}>找不到此藝人</div>}
        {!isLoading && data && (
          <ArtistSubmissionForm
            mode="edit"
            existingArtist={data}
            canEditGroupNames
            onSuccess={backToList}
            onCancel={backToList}
          />
        )}
      </main>
    </div>
  );
}
