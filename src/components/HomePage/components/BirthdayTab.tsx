import { Artist } from '@/types';
import ArtistCard from '../../ArtistCard';
import SearchSection from './SearchSection';
import { ArtistList, EmptyState, LoadingContainer } from './styles';

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
        <LoadingContainer>
          <div className="spinner" />
          <p>載入當週壽星中...</p>
        </LoadingContainer>
      ) : artists.length > 0 ? (
        <ArtistList>
          {artists.map((artist) => {
            if (!artist.birthday) return null;
            return <ArtistCard key={artist.id} artist={artist} handleArtistClick={onArtistClick} />;
          })}
        </ArtistList>
      ) : (
        <EmptyState>
          <div className="icon">🎂</div>
          <h3>本週沒有壽星</h3>
          <p>可以切換查看其他週的壽星，或直接搜尋你的偶像</p>
        </EmptyState>
      )}
    </>
  );
}
