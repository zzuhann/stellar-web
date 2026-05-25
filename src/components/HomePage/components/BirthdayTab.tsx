import { Artist } from '@/types';
import WeekArtistCard from './WeekArtistCard';
import SearchSection from './SearchSection';
import { css } from '@/styled-system/css';
import EmptyState from '../../EmptyState';
import Skeleton from '../../ui/Skeleton';

const artistListContainer = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '3',
  marginTop: '4',
});

const skeletonCard = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  gap: '2',
});

const skeletonFooterRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

function ArtistCardSkeleton() {
  return (
    <div className={skeletonCard}>
      <Skeleton width={56} height={56} borderRadius="50%" />
      <Skeleton width="70%" height={14} />
      <Skeleton width="45%" height={12} />
      <Skeleton width="100%" height={1} />
      <div className={skeletonFooterRow}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="25%" height={12} />
      </div>
    </div>
  );
}

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
        <div className={artistListContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ArtistCardSkeleton key={i} />
          ))}
        </div>
      ) : artists.length > 0 ? (
        <div className={artistListContainer}>
          {artists.map((artist) => {
            if (!artist.birthday) return null;
            return <WeekArtistCard key={artist.id} artist={artist} />;
          })}
        </div>
      ) : (
        <EmptyState
          icon="🎂"
          title="當週沒有壽星"
          description="可以切換查看其他週的壽星，或直接搜尋藝人、團體"
        />
      )}
    </>
  );
}
