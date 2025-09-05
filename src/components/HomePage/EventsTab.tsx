import { CoffeeEvent } from '@/types';
import VerticalEventCard from '../EventCard/VerticalEventCard';
import { EventList, EmptyState, LoadingContainer } from './styles';

interface EventsTabProps {
  events: CoffeeEvent[];
  loading: boolean;
  onEventClick: (event: CoffeeEvent) => void;
}

export default function EventsTab({ events, loading, onEventClick }: EventsTabProps) {
  return (
    <>
      {loading ? (
        <LoadingContainer>
          <div className="spinner" />
          <p>載入當週生日應援中...</p>
        </LoadingContainer>
      ) : events.length > 0 ? (
        <EventList>
          {events.map((event) => (
            <VerticalEventCard key={event.id} event={event} onClick={onEventClick} />
          ))}
        </EventList>
      ) : (
        <EmptyState>
          <div className="icon">🎉</div>
          <h3>本週沒有生日應援</h3>
          <p>可以切換查看其他週的生日應援活動</p>
        </EmptyState>
      )}
    </>
  );
}
