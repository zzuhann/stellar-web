import { MapEvent } from '@/types';
import { formatDateRange } from '@/utils';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { styled } from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const DescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);

  @media (max-width: 400px) {
    font-size: 12px;
  }
`;

const Description = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ImageContainer = styled.div<{ $imageUrl: string }>`
  width: 100px;
  height: 100px;
  min-width: 100px;
  min-height: 100px;
  border-radius: var(--radius-lg);
  background-image: url(${(props) => props.$imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media (max-width: 400px) {
    width: 80px;
    height: 80px;
    min-width: 80px;
    min-height: 80px;
  }
`;

type EventCardProps = {
  event: MapEvent;
};

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link href={`/event/${event.id}`}>
      <Container key={event.id}>
        <InfoContainer>
          <Title>{event.title}</Title>
          <DescriptionContainer>
            <CalendarIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <Description>{formatDateRange(event.datetime.start, event.datetime.end)}</Description>
          </DescriptionContainer>
          <DescriptionContainer>
            <MapPinIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <Description>
              {event.location.name} ({event.location.address})
            </Description>
          </DescriptionContainer>
        </InfoContainer>
        <ImageContainer $imageUrl={event.mainImage || ''} />
      </Container>
    </Link>
  );
};

export default EventCard;
