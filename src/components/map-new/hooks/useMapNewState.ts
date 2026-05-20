import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const mode: MapMode = searchParams.get('mode') === 'list' ? 'list' : 'map';

  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [selectedLocationEvents, setSelectedLocationEvents] = useState<MapEvent[] | null>(null);

  const setMode = (newMode: MapMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newMode === 'list') {
      params.set('mode', 'list');
    } else {
      params.delete('mode');
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`);
  };

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
    mode,
    selectedEvent,
    selectedLocationEvents,
    setMode,
    selectEvent,
    selectLocation,
    clearSelection,
  };
}
