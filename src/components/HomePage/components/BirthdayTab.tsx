import { Artist } from '@/types';
import ArtistCard from '../../ArtistCard';
import SearchSection from './SearchSection';
import { css } from '@/styled-system/css';
import EmptyState from './EmptyState';
import Loading from './Loading';

const artistListContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

interface BirthdayTabProps {
  artists: Artist[];
  loading: boolean;
  onSearchClick: () => void;
  onArtistClick: (artist: Artist) => void;
}

export default function BirthdayTab({
  artists,
  loading,
  onSearchClick,
  onArtistClick,
}: BirthdayTabProps) {
  return (
    <>
      <SearchSection onSearchClick={onSearchClick} />

      {loading ? (
        <Loading description="載入當週壽星中..." />
      ) : artists.length > 0 ? (
        <div className={artistListContainer}>
          {artists.map((artist) => {
            if (!artist.birthday) return null;
            return <ArtistCard key={artist.id} artist={artist} handleArtistClick={onArtistClick} />;
          })}
        </div>
      ) : (
        <EmptyState
          icon="🎂"
          title="本週沒有壽星"
          description="可以切換查看其他週的壽星，或直接搜尋你的偶像"
        />
      )}
    </>
  );
}
