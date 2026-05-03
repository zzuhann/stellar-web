import { Artist } from '@/types';
import ArtistCardLink from '../../ArtistCard/ArtistCardLink';
import SearchSection from './SearchSection';
import { css } from '@/styled-system/css';
import EmptyState from '../../EmptyState';
import Loading from '../../Loading';

const artistListContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  marginTop: '4',
});

interface BirthdayTabProps {
  artists: Artist[];
  loading: boolean;
  onSearchClick: () => void;
  searchTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function BirthdayTab({
  artists,
  loading,
  onSearchClick,
  searchTriggerRef,
}: BirthdayTabProps) {
  return (
    <>
      <SearchSection ref={searchTriggerRef} onSearchClick={onSearchClick} />

      <div className={artistListContainer}>
        {loading ? (
          <Loading description="載入當週壽星中..." />
        ) : artists.length > 0 ? (
          <>
            {artists.map((artist) => {
              if (!artist.birthday) return null;
              return <ArtistCardLink key={artist.id} artist={artist} />;
            })}
          </>
        ) : (
          <EmptyState
            icon="🎂"
            title="當週沒有壽星"
            description="可以切換查看其他週的壽星，或直接搜尋你的藝人"
          />
        )}
      </div>
    </>
  );
}
