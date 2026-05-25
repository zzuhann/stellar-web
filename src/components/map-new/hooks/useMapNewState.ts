import { useState } from 'react';
import { MapEvent } from '@/types';

export interface MapNewState {
  selectedEvent: MapEvent | null;
  selectedLocationEvents: MapEvent[] | null;
  selectEvent: (event: MapEvent | null) => void;
  selectLocation: (events: MapEvent[] | null) => void;
  clearSelection: () => void;
}

export function useMapNewState(): MapNewState {
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [selectedLocationEvents, setSelectedLocationEvents] = useState<MapEvent[] | null>(null);

  const selectEvent = (event: MapEvent | null) => {
    setSelectedEvent(event);
    setSelectedLocationEvents(null);
  };
  const selectLocation = (events: MapEvent[] | null) => {
    setSelectedLocationEvents(events);
    setSelectedEvent(null);
  };
  const clearSelection = () => {
    setSelectedEvent(null);
    setSelectedLocationEvents(null);
  };

  return {
    selectedEvent,
    selectedLocationEvents,
    selectEvent,
    selectLocation,
    clearSelection,
  };
}
