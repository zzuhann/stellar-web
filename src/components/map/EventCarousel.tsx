'use client';

import { RefObject } from 'react';
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
  artistId: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  onBeforeNavigate?: () => void;
}

const EventCarousel = ({
  events,
  artistId,
  containerRef,
  onBeforeNavigate,
}: EventCarouselProps) => {
  return (
    <div className={carouselWrapper}>
      <div className={scrollContainer} ref={containerRef}>
        {events.map((event) => (
          <EventCarouselCard
            key={event.id}
            event={event}
            artistId={artistId}
            onBeforeNavigate={onBeforeNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
