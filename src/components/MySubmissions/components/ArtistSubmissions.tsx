import { css } from '@/styled-system/css';
import CardHeader from './CardHeader';
import EmptyState from './EmptyState';
import VerticalArtistCard from '@/components/ArtistCard/VerticalArtistCard';
import { useRouter } from 'next/navigation';
import { firebaseTimestampToDate } from '@/utils';
import { Artist, FirebaseTimestamp } from '@/types';
import { actionButton, actionButtons, contentCard } from './styles';
import { useMemo } from 'react';

const artistGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
  padding: '16px',
});

const artistInfo = css({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  height: '60px',
  justifyContent: 'center',
});

type ArtistSubmissionsProps = {
  artists: Artist[];
};

const ArtistSubmissions = ({ artists }: ArtistSubmissionsProps) => {
  const router = useRouter();

  const isSubmitted = artists.length > 0;

  const handleEditArtist = (e: React.MouseEvent, artist: Artist) => {
    e.stopPropagation();
    router.push(`/submit-artist?edit=${artist.id}`);
  };

  // 把 rejected 狀態排到最上面
  const userArtists = useMemo(() => {
    if (!artists) return [];
    return [...artists].sort((a, b) => {
      if (a.status === 'rejected' && b.status !== 'rejected') return -1;
      if (a.status !== 'rejected' && b.status === 'rejected') return 1;
      return 0;
    });
  }, [artists]);

  return (
    <div className={contentCard}>
      <CardHeader
        title="我投稿的偶像"
        description={isSubmitted ? `共投稿過 ${userArtists.length} 位偶像` : '還沒有投稿過偶像'}
      />

      {!isSubmitted ? (
        <EmptyState icon="✨" title="還沒有投稿過偶像" />
      ) : (
        <div className={artistGrid}>
          {userArtists.map((artist) => (
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
      )}
    </div>
  );
};

export default ArtistSubmissions;
