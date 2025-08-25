import { CoffeeEvent } from '@/types';
import styled from 'styled-components';
import { firebaseTimestampToDate } from '@/utils';
import { FirebaseTimestamp } from '@/types';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const VerticalEventCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const EventImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 360px;
  background-image: url(${(props) => props.$imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg-secondary);
  position: relative;
`;

const ImageOverlay = styled.div<{ $isApproved: boolean; $hasActionButtons: boolean }>`
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

  ${({ $isApproved }) =>
    $isApproved &&
    `
    cursor: pointer;
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 60px;
  padding-left: 16px;
  padding-right: 16px;
`;

const EventTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const EventArtistSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

const EventArtistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventArtistAvatar = styled.div<{ imageUrl?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  background-image: url(${(props) => props.imageUrl ?? ''});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
`;

const EventArtistName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const EventArtistSeparator = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 2px;
`;

const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const EventDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SubmissionTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
`;

const StatusBadge = styled.span<{ status: 'pending' | 'approved' | 'rejected' }>`
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
    switch (props.status) {
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
      case 'pending':
      default:
        return `
          background: #fef3c7;
          color: #92400e;
        `;
    }
  }}
`;

const getStatusText = (status: 'pending' | 'approved' | 'rejected', rejectedReason?: string) => {
  switch (status) {
    case 'approved':
      return '已通過';
    case 'rejected':
      return `未通過：${rejectedReason}`;
    case 'pending':
    default:
      return '審核中';
  }
};

interface VerticalEventCardProps {
  event: CoffeeEvent;
  onClick?: (event: CoffeeEvent) => void;
  actionButtons?: React.ReactElement;
}

const VerticalEventCard = ({ event, onClick, actionButtons }: VerticalEventCardProps) => {
  const submissionTime = event.createdAt
    ? firebaseTimestampToDate(event.createdAt as FirebaseTimestamp).toLocaleDateString('zh-TW')
    : '';

  return (
    <VerticalEventCardContainer>
      <EventImage $imageUrl={event.mainImage ?? ''} />

      <StatusBadge status={event.status}>
        {getStatusText(event.status, event.rejectedReason)}
      </StatusBadge>

      <ImageOverlay
        $hasActionButtons={!!actionButtons}
        $isApproved={event.status === 'approved'}
        onClick={() => onClick?.(event)}
      >
        <EventTitle>{event.title}</EventTitle>

        {event.artists && event.artists.length > 0 && (
          <EventArtistSection>
            {event.artists.map((artist, index) => (
              <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
                {index > 0 && <EventArtistSeparator>/</EventArtistSeparator>}
                <EventArtistItem>
                  <EventArtistAvatar imageUrl={artist.profileImage} />
                  <EventArtistName>{artist.name || 'Unknown Artist'}</EventArtistName>
                </EventArtistItem>
              </div>
            ))}
          </EventArtistSection>
        )}

        <EventDetails>
          <EventDetailItem>
            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
            <span>
              {firebaseTimestampToDate(event.datetime.start).toLocaleDateString('zh-TW')} -
              {firebaseTimestampToDate(event.datetime.end).toLocaleDateString('zh-TW')}
            </span>
          </EventDetailItem>

          {event.location.name && (
            <EventDetailItem>
              <MapPinIcon className="h-3 w-3 flex-shrink-0" />
              <span>{event.location.name}</span>
            </EventDetailItem>
          )}
        </EventDetails>

        {submissionTime && <SubmissionTime>投稿時間：{submissionTime}</SubmissionTime>}
      </ImageOverlay>

      {actionButtons && <ButtonContainer>{actionButtons}</ButtonContainer>}
    </VerticalEventCardContainer>
  );
};

export default VerticalEventCard;
