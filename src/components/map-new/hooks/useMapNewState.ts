import { useState } from 'react';
import { useQueryState } from '@/hooks/useQueryState';
import { MapEvent } from '@/types';

export type MapMode = 'map' | 'list';

export interface MapNewState {
  mode: MapMode;
  selectedEvent: MapEvent | null;
  selectedLocationEvents: MapEvent[] | null;
  setMode: (mode: MapMode) => void;
  selectEvent: (event: MapEvent | null) => void;
  selectLocation: (events: MapEvent[] | null) => void;
  clearSelection: () => void;
}

export function useMapNewState(): MapNewState {
  // Sync mode to URL: only write 'list', remove param when 'map'
  const [modeParam, setModeParam] = useQueryState<MapMode>('mode', {
    defaultValue: 'map',
    parse: (value): MapMode => (value === 'list' ? 'list' : 'map'),
  });

  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [selectedLocationEvents, setSelectedLocationEvents] = useState<MapEvent[] | null>(null);

  const setMode = (mode: MapMode) => {
    setModeParam(mode === 'list' ? mode : null);
  };

  const selectEvent = (event: MapEvent | null) => {
    setSelectedEvent(event);
  };

  const selectLocation = (events: MapEvent[] | null) => {
    setSelectedLocationEvents(events);
  };

  const clearSelection = () => {
    setSelectedEvent(null);
    setSelectedLocationEvents(null);
  };

  return {
    mode: modeParam,
    selectedEvent,
    selectedLocationEvents,
    setMode,
    selectEvent,
    selectLocation,
    clearSelection,
  };
}
