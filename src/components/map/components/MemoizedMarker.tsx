import { MapEvent } from '@/types';
import { DivIcon } from 'leaflet';
import { memo } from 'react';
import { Marker } from 'react-leaflet';

// Memoized Marker 組件，防止不必要的重新渲染
const MemoizedMarker = memo(
  ({
    event,
    icon,
    onMarkerClick,
  }: {
    event: MapEvent;
    icon: DivIcon;
    onMarkerClick: (event: MapEvent) => void;
  }) => (
    <Marker
      key={event.id}
      position={[event.location.coordinates.lat, event.location.coordinates.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onMarkerClick(event),
      }}
    />
  )
);

MemoizedMarker.displayName = 'MemoizedMarker';

export default MemoizedMarker;
