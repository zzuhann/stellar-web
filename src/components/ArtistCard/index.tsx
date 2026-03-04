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
  transition: 'all 0.2s ease',
  boxShadow: 'shadow.sm',
});

const avatarContainer = css({
  position: 'relative',
  width: '64px',
  height: '64px',
});

const artistAvatar = css({
  borderRadius: '50%',
  overflow: 'hidden',
  objectFit: 'cover',
});

const birthdayHat = css({
  position: 'absolute',
  top: '-8px',
  right: '-4px',
  width: '24px',
  height: '24px',
  transform: 'rotate(15deg)',
  zIndex: 2,
  filter: 'drop-shadow(0 2px 4px var(--colors-alpha-black-20))',
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

const srOnly = css({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const getBirthdayText = (birthday: string): { text: string; isToday: boolean } => {
  if (!birthday) return { text: '', isToday: false };

  const date = new Date(birthday);
  return { text: `${date.getMonth() + 1} 月 ${date.getDate()} 日`, isToday: false };
};

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
  const { text: birthdayText } = getBirthdayText(artist.birthday ?? '');
  const isBirthday = shouldShowBirthdayHat(artist.birthday ?? '');

  return (
    <div className={artistCardContainer}>
      <div className={avatarContainer}>
        <Image
          src={artist.profileImage ?? '/default_profile.png'}
          alt={artist.stageName}
          width={64}
          height={64}
          className={artistAvatar}
        />
        {isBirthday && (
          <Image
            className={birthdayHat}
            src="/party-hat.png"
            alt="今日壽星"
            width={24}
            height={24}
          />
        )}
      </div>

      <div className={artistInfo}>
        <h3 className={artistName}>
          {artist.stageName.toUpperCase()} {artist.realName}
        </h3>
        <div className={artistBirthday}>
          <span className={srOnly}>生日</span>
          <span aria-hidden="true">🎂：</span>
          <span className="birthday-date">{birthdayText}</span>
        </div>
        <div className={eventStatus}>
          <span className="icon" aria-label="目前生日應援數量">
            📍
          </span>
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
