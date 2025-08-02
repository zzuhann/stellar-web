import { Artist } from '@/types';
import { getDaysUntilBirthday } from '@/utils';
import styled from 'styled-components';

const ArtistCardContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    border-color: var(--color-primary);
  }
`;

const ArtistAvatar = styled.div<{ avatarUrl: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-image: url(${(props) => props.avatarUrl});
  background-size: cover;
  background-position: center;
`;

const ArtistInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArtistName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const ArtistBirthday = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;

  .birthday-label {
    color: var(--color-text-secondary);
  }

  .birthday-date {
    font-weight: 500;
  }

  .today-indicator {
    color: var(--color-accent);
    font-weight: 600;
    margin-left: 8px;
  }
`;

const EventStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 500;

  .icon {
    font-size: 12px;
  }
`;

const getBirthdayText = (birthday: string): { text: string; isToday: boolean } => {
  if (!birthday) return { text: '', isToday: false };
  const daysUntil = getDaysUntilBirthday(birthday);

  if (daysUntil === 0) {
    return { text: '今天！', isToday: true };
  } else if (daysUntil === 1) {
    return { text: '明天', isToday: false };
  } else if (daysUntil <= 7) {
    return { text: `${daysUntil}天後`, isToday: false };
  } else {
    const date = new Date(birthday);
    return { text: `${date.getMonth() + 1}月${date.getDate()}日`, isToday: false };
  }
};

interface ArtistCardProps {
  artist: Artist;
  handleArtistClick: (artist: Artist) => void;
}

const ArtistCard = ({ artist, handleArtistClick }: ArtistCardProps) => {
  const { text: birthdayText } = getBirthdayText(artist.birthday ?? '');

  return (
    <ArtistCardContainer key={artist.id} onClick={() => handleArtistClick(artist)}>
      <ArtistAvatar avatarUrl={artist.profileImage ?? ''} />

      <ArtistInfo>
        <ArtistName>{artist.stageName}</ArtistName>
        <ArtistBirthday>
          <span className="birthday-label">🎂: </span>
          <span className="birthday-date">{birthdayText}</span>
        </ArtistBirthday>
        <EventStatus>
          <span className="icon">📍</span>
          <span>
            {artist.coffeeEventCount !== undefined && artist.coffeeEventCount > 0
              ? `${artist.coffeeEventCount} 個生咖進行中`
              : '目前無任何生咖'}
          </span>
        </EventStatus>
      </ArtistInfo>
    </ArtistCardContainer>
  );
};

export default ArtistCard;
