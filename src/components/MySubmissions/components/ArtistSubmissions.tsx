import { css } from '@/styled-system/css';
import CardHeader from './CardHeader';
import EmptyState from './EmptyState';
import VerticalArtistCard from '@/components/ArtistCard/VerticalArtistCard';
import { useRouter } from 'next/navigation';
import { firebaseTimestampToDate } from '@/utils';
import {
  Artist,
  FirebaseTimestamp,
  UserSubmissionResourceSummary,
  UserSubmissionsPagination,
} from '@/types';
import { actionButton, actionButtons, contentCard } from './styles';
import SubmissionsPagination from './SubmissionsPagination';

const artistGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '4',
  padding: '4',
});

const artistInfo = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  height: '60px',
  justifyContent: 'center',
});

type ArtistSubmissionsProps = {
  artists: Artist[];
  summary: UserSubmissionResourceSummary;
  pagination: UserSubmissionsPagination;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const ArtistSubmissions = ({
  artists,
  summary,
  pagination,
  currentPage,
  onPageChange,
}: ArtistSubmissionsProps) => {
  const router = useRouter();

  const hasAnySubmission = summary.total > 0;

  const handleEditArtist = (e: React.MouseEvent, artist: Artist) => {
    e.stopPropagation();
    router.push(`/submit-artist?edit=${artist.id}`);
  };

  return (
    <div className={contentCard}>
      <CardHeader
        title="我投稿的偶像"
        description={hasAnySubmission ? `共投稿過 ${summary.total} 位偶像` : '還沒有投稿過偶像'}
      />

      {!hasAnySubmission ? (
        <EmptyState icon="✨" title="還沒有投稿過偶像" />
      ) : (
        <>
          <div className={artistGrid}>
            {artists.map((artist) => (
              <VerticalArtistCard
                key={artist.id}
                artist={artist}
                onClick={(artist) => {
                  router.push(`/map/${artist.id}`);
                }}
                submissionTime={
                  artist.createdAt
                    ? firebaseTimestampToDate(artist.createdAt as FirebaseTimestamp).toLocaleString(
                        'zh-TW'
                      )
                    : undefined
                }
                actionButtons={
                  artist.status === 'rejected' ? (
                    <div className={artistInfo}>
                      <div className={actionButtons}>
                        {artist.status === 'rejected' && (
                          <button
                            className={actionButton({ variant: 'edit' })}
                            onClick={(e) => handleEditArtist(e, artist)}
                            title="編輯並重新送審"
                          >
                            編輯並重新送審
                          </button>
                        )}
                      </div>
                    </div>
                  ) : undefined
                }
              />
            ))}
          </div>

          <SubmissionsPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default ArtistSubmissions;
