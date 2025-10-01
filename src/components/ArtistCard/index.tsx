import { Artist } from '@/types';
import { shouldShowBirthdayHat } from '@/utils/birthdayHelpers';
import { css } from '@/styled-system/css';
import Image from 'next/image';

const artistCardContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '20px',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: 'shadow.sm',
});

const avatarContainer = css({
  position: 'relative',
  width: '64px',
  height: '64px',
});

const artistAvatar = css({
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const birthdayHat = css({
  position: 'absolute',
  top: '-8px',
  right: '-4px',
  width: '24px',
  height: '24px',
  transform: 'rotate(15deg)',
  zIndex: 2,
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
});

const artistInfo = css({
  flex: 1,
  minWidth: 0,
});

const artistName = css({
  fontSize: '16px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 4px 0',
  '@media (min-width: 768px)': {
    fontSize: '20px',
  },
});

const artistBirthday = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  marginBottom: '8px',
  '& .birthday-label': {
    color: 'color.text.secondary',
  },
  '& .birthday-date': {
    fontWeight: '500',
  },
  '& .today-indicator': {
    color: 'color.accent',
    fontWeight: '600',
    marginLeft: '8px',
  },
});

const eventStatus = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '14px',
  color: 'color.primary',
  fontWeight: '500',
  '& .icon': {
    fontSize: '12px',
  },
});

const getBirthdayText = (birthday: string): { text: string; isToday: boolean } => {
  if (!birthday) return { text: '', isToday: false };

  const date = new Date(birthday);
  return { text: `${date.getMonth() + 1} 月 ${date.getDate()} 日`, isToday: false };
};

interface ArtistCardProps {
  artist: Artist;
  handleArtistClick: (artist: Artist) => void;
}

const ArtistCard = ({ artist, handleArtistClick }: ArtistCardProps) => {
  const { text: birthdayText } = getBirthdayText(artist.birthday ?? '');
  const isBirthday = shouldShowBirthdayHat(artist.birthday ?? '');

  return (
    <div className={artistCardContainer} key={artist.id} onClick={() => handleArtistClick(artist)}>
      <div className={avatarContainer}>
        <div
          className={artistAvatar}
          style={{
            backgroundImage: artist.profileImage ? `url(${artist.profileImage})` : undefined,
          }}
        />
        {isBirthday && (
          <Image className={birthdayHat} src="/party-hat.png" alt="生日帽" width={24} height={24} />
        )}
      </div>

      <div className={artistInfo}>
        <h3 className={artistName}>
          {artist.stageName.toUpperCase()} {artist.realName}
        </h3>
        <div className={artistBirthday}>
          <span className="birthday-label">🎂：</span>
          <span className="birthday-date">{birthdayText}</span>
        </div>
        <div className={eventStatus}>
          <span className="icon">📍</span>
          <span>
            {artist.coffeeEventCount !== undefined && artist.coffeeEventCount > 0
              ? `${artist.coffeeEventCount} 個生日應援`
              : '目前無任何生日應援'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
