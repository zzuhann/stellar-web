import { css } from '@/styled-system/css';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';
import { TopArtist } from '@/lib/api';

const topArtistItem = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5',
  flexShrink: 0,
  width: '72px',
});

const avatarWrapper = css({
  position: 'relative',
  width: '68px',
  height: '68px',
  borderRadius: 'radius.circle',
  padding: '0.5',
  // 使用 stellarBlue 色系漸層
  background: 'linear-gradient(135deg, #3F5A72 0%, #CDE6F4 50%, #344D63 100%)',
});

const avatarInner = css({
  width: '100%',
  height: '100%',
  borderRadius: 'radius.circle',
  overflow: 'hidden',
  border: '2px solid',
  borderColor: 'color.background.primary',
  backgroundColor: 'color.background.secondary',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

const artistName = css({
  textStyle: 'caption',
  color: 'color.text.primary',
  textAlign: 'center',
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  margin: 0,
});

const eventCountStyle = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5',
});

export function TopArtistCardSkeleton() {
  return (
    <div className={topArtistItem}>
      <Skeleton width="68px" height="68px" borderRadius="50%" />
      <Skeleton width="48px" height="12px" borderRadius="4px" />
      <Skeleton width="40px" height="12px" borderRadius="4px" />
    </div>
  );
}

interface TopArtistCardProps {
  artist: TopArtist;
  onClick?: (artistId: string) => void;
}

const TopArtistCard = ({ artist, onClick }: TopArtistCardProps) => {
  const eventCount = artist.upcomingEventCount ?? 0;

  return (
    <Link href={`/map/${artist.id}`} className={topArtistItem} onClick={() => onClick?.(artist.id)}>
      <div className={avatarWrapper}>
        <div
          className={avatarInner}
          style={{
            backgroundImage: artist.profileImage ? `url(${artist.profileImage})` : undefined,
          }}
        />
      </div>
      <div>
        <p className={artistName}>{artist.stageName}</p>
        <p className={artistName}>{artist.realName}</p>
      </div>
      <div className={eventCountStyle}>
        <span>{eventCount} 個</span>
      </div>
    </Link>
  );
};

export default TopArtistCard;
