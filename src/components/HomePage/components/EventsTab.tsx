import { CoffeeEvent } from '@/types';
import WeekEventCard from './WeekEventCard';
import EmptyState from '../../EmptyState';
import { css } from '@/styled-system/css';
import Skeleton from '../../ui/Skeleton';

const eventListContainer = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '3',
  marginTop: '4',
});

const skeletonCard = css({
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '1',
  gap: '2',
});

const skeletonImageArea = css({
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: 'radius.md',
});

const skeletonInfoArea = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5',
  paddingX: '1',
  paddingBottom: '1',
});

function EventCardSkeleton() {
  return (
    <div className={skeletonCard}>
      <Skeleton width="100%" height="auto" className={skeletonImageArea} />
      <div className={skeletonInfoArea}>
        <Skeleton width="90%" height={14} />
        <Skeleton width="60%" height={14} />
        <Skeleton width="70%" height={12} />
        <Skeleton width="55%" height={12} />
      </div>
    </div>
  );
}

interface EventsTabProps {
  events: CoffeeEvent[];
  loading: boolean;
}

export default function EventsTab({ events, loading }: EventsTabProps) {
  return (
    <>
      {loading ? (
        <div className={eventListContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className={eventListContainer}>
          {events.map((event) => (
            <WeekEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎉"
          title="本週沒有生日應援"
          description="可以切換查看其他週的生日應援活動"
        />
      )}
    </>
  );
}
