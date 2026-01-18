'use client';

import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';

const artistSection = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const artistItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
});

const artistAvatar = css({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'color.background.secondary',
  flexShrink: '0',
});

const artistName = css({
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
});

const artistSeparator = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0 4px',
});

interface Artist {
  id: string;
  name: string;
  profileImage?: string;
}

interface ArtistSectionProps {
  artists: Artist[];
}

export default function ArtistSection({ artists }: ArtistSectionProps) {
  const router = useRouter();

  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <div className={artistSection}>
      {artists.map((artist, index) => (
        <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
          {index > 0 && <span className={artistSeparator}>/</span>}
          <div className={artistItem} onClick={() => router.push(`/map/${artist.id}`)}>
            <div
              className={artistAvatar}
              style={{ backgroundImage: `url(${artist.profileImage})` }}
            />
            <span className={artistName}>{artist.name || ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
