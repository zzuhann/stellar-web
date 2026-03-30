import { CoffeeEvent } from '@/types';
import VerticalEventCard from '../../EventCard/VerticalEventCard';
import EmptyState from '../../EmptyState';
import { css } from '@/styled-system/css';
import Loading from '../../Loading';

const eventListContainer = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '4',
  marginTop: '4',
  '@media (min-width: 600px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
});

interface EventsTabProps {
  events: CoffeeEvent[];
  loading: boolean;
}

export default function EventsTab({ events, loading }: EventsTabProps) {
  return (
    <div className={eventListContainer}>
      {loading ? (
        <Loading description="載入當週生日應援中..." />
      ) : events.length > 0 ? (
        <>
          {events.map((event) => (
            <VerticalEventCard key={event.id} event={event} />
          ))}
        </>
      ) : (
        <EmptyState
          icon="🎉"
          title="本週沒有生日應援"
          description="可以切換查看其他週的生日應援活動"
        />
      )}
    </div>
  );
}
