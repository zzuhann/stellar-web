import { Artist } from '@/types';
import ArtistCard from '../../ArtistCard';
import SearchSection from './SearchSection';
import { css } from '@/styled-system/css';
import EmptyState from '../../EmptyState';
import Loading from '../../Loading';
import Link from 'next/link';

const artistListContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '16px',
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

      {loading ? (
        <Loading description="載入當週壽星中..." />
      ) : artists.length > 0 ? (
        <div className={artistListContainer}>
          {artists.map((artist) => {
            if (!artist.birthday) return null;
            return (
              <Link
                href={`/map/${artist.id}`}
                key={artist.id}
                aria-label={`前往 ${artist.stageName} 的生日應援地圖頁面`}
              >
                <ArtistCard artist={artist} />
              </Link>
            );
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
