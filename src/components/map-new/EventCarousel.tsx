'use client';

import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import EventCarouselCard from './EventCarouselCard';

const carouselWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '4',
});

const scrollContainer = css({
  display: 'flex',
  gap: '3',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  paddingX: '4',
  paddingBottom: '2',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

export interface EventCarouselProps {
  events: MapEvent[];
}

const EventCarousel = ({ events }: EventCarouselProps) => {
  return (
    <div className={carouselWrapper}>
      <div className={scrollContainer}>
        {events.map((event) => (
          <EventCarouselCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
