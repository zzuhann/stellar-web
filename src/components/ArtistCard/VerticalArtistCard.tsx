import { Artist } from '@/types';
import styled from 'styled-components';
import { FirebaseTimestamp } from '@/types';

const VerticalArtistCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  height: 360px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const ArtistImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.$imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg-secondary);
  position: relative;
`;

const ImageOverlay = styled.div<{
  $isRejected: boolean;
  $hasActionButtons: boolean;
  $isExists: boolean;
}>`
  position: absolute;
  bottom: ${({ $hasActionButtons }) => ($hasActionButtons ? '60px' : '0')};
  left: 0;
  right: 0;
  top: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  padding: 16px;
  color: white;
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  cursor: ${({ $isExists }) => ($isExists ? 'pointer' : 'default')};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 60px;
`;

const ArtistName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const ArtistBirthday = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SubmissionTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const StatusBadge = styled.span<{ $status: 'pending' | 'approved' | 'rejected' | 'exists' }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;

  ${(props) => {
    switch (props.$status) {
      case 'approved':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'rejected':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      case 'exists':
        return `
          background: #e0e7ff;
          color: #3730a3;
        `;
      case 'pending':
      default:
        return `
          background: #fef3c7;
          color: #92400e;
        `;
    }
  }}
`;

const getStatusText = (
  status: 'pending' | 'approved' | 'rejected' | 'exists',
  rejectedReason?: string
) => {
  switch (status) {
    case 'approved':
      return '已通過';
    case 'rejected':
      return `未通過：${rejectedReason}`;
    case 'exists':
      return '已存在';
    case 'pending':
    default:
      return '審核中';
  }
};

const getBirthdayText = (birthday: string): string => {
  if (!birthday) return '';
  const date = new Date(birthday);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

interface VerticalArtistCardProps {
  artist: Artist & {
    status?: 'pending' | 'approved' | 'rejected' | 'exists';
    rejectedReason?: string;
    createdAt?: string | FirebaseTimestamp;
  };
  onClick?: (artist: Artist) => void;
  actionButtons?: React.ReactElement;
  submissionTime?: string;
}

const VerticalArtistCard = ({
  artist,
  onClick,
  actionButtons,
  submissionTime,
}: VerticalArtistCardProps) => {
  const birthdayText = getBirthdayText(artist.birthday ?? '');

  return (
    <VerticalArtistCardContainer>
      <ArtistImage $imageUrl={artist.profileImage ?? ''} />

      {artist.status && (
        <StatusBadge $status={artist.status}>
          {getStatusText(artist.status, artist.rejectedReason)}
        </StatusBadge>
      )}

      <ImageOverlay
        $hasActionButtons={!!actionButtons}
        $isRejected={artist.status === 'rejected'}
        $isExists={artist.status === 'exists' || artist.status === 'approved'}
        onClick={() => {
          if (artist.status === 'approved' || artist.status === 'exists') {
            onClick?.(artist);
          }
        }}
      >
        <ArtistName>
          {artist.stageName}
          {artist.stageNameZh && `/${artist.stageNameZh}`}{' '}
          {artist.realName && `(${artist.realName})`}
        </ArtistName>

        {birthdayText && <ArtistBirthday>🎂 {birthdayText}</ArtistBirthday>}

        {submissionTime && <SubmissionTime>投稿時間：{submissionTime}</SubmissionTime>}
      </ImageOverlay>

      {actionButtons && <ButtonContainer>{actionButtons}</ButtonContainer>}
    </VerticalArtistCardContainer>
  );
};

export default VerticalArtistCard;
