import { useCallback, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { DivIcon, Point } from 'leaflet';
import { sendGAEvent } from '@next/third-parties/google';
import { Artist, MapEvent } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { createImageIcon } from '@/components/map/utils/createImageIcon';
import MemoizedMarker from '@/components/map/components/MemoizedMarker';

interface MarkerLayerProps {
  artistId: string;
  mapEvents: MapEvent[];
  artistData: Artist | null;
  selectedEventId: string | null;
  onSingleMarkerClick: (event: MapEvent) => void;
  onMultiMarkerClick: (events: MapEvent[]) => void;
  onClearSelection: () => void;
}

const MarkerLayer = ({
  artistId,
  mapEvents,
  artistData,
  selectedEventId,
  onSingleMarkerClick,
  onMultiMarkerClick,
  onClearSelection,
}: MarkerLayerProps) => {
  const map = useMap();
  const { user } = useAuth();
  // Tracks the pending moveend listener so we can remove it before rebinding
  const pendingMoveEndRef = useRef<(() => void) | null>(null);
  const profileImage = artistData?.profileImage;

  // Group events by location
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, MapEvent[]>();
    mapEvents.forEach((event) => {
      const key = `${event.location.coordinates.lat.toFixed(6)}_${event.location.coordinates.lng.toFixed(6)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(event);
    });
    return groups;
  }, [mapEvents]);

  // Cache marker icons by imageUrl + isSelected state
  const markerIcons = useMemo(() => {
    const iconCache = new Map<string, DivIcon>();
    mapEvents.forEach((event) => {
      const isSelected = selectedEventId === event.id;
      const cacheKey = `${event.mainImage || 'default'}_${isSelected}`;
      if (!iconCache.has(cacheKey)) {
        iconCache.set(cacheKey, createImageIcon(event.mainImage, isSelected));
      }
    });
    return iconCache;
  }, [mapEvents, selectedEventId]);

  const createClusterIcon = useCallback(
    (cluster: { getChildCount(): number }) => {
      const count = cluster.getChildCount();

      let size = 50;
      let className = 'marker-cluster-small';

      if (count < 10) {
        size = 50;
        className = 'marker-cluster-small';
      } else if (count < 100) {
        size = 60;
        className = 'marker-cluster-medium';
      } else {
        size = 70;
        className = 'marker-cluster-large';
      }

      if (profileImage) {
        const html = `
    <div role="img" aria-label="${count} 個活動" style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-image: url('${profileImage}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border: 3px solid white;
      box-shadow: var(--shadow-md);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div aria-hidden="true" style="
        background: rgba(0, 0, 0, 0.2);
        color: #fff;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        box-shadow: var(--shadow-sm);
      ">
        ${count}
      </div>
    </div>
  `;
        return new DivIcon({
          html,
          className: '',
          iconSize: new Point(size, size),
          iconAnchor: [size / 2, size / 2],
        });
      }

      return new DivIcon({
        html: `<div role="img" aria-label="${count} 個活動"><span aria-hidden="true">${count}</span></div>`,
        className: `marker-cluster ${className}`,
        iconSize: new Point(size, size),
      });
    },
    [profileImage]
  );

  const handleClusterClick = useCallback(
    (clusterEvent: {
      layer: {
        getBounds(): L.LatLngBounds;
        getAllChildMarkers(): Array<{ getLatLng(): { lat: number; lng: number } }>;
      };
      originalEvent: { preventDefault(): void; stopPropagation(): void };
    }) => {
      const cluster = clusterEvent.layer;
      const childMarkers = cluster.getAllChildMarkers();
      const positions = new Set(
        childMarkers.map((m) => `${m.getLatLng().lat.toFixed(6)}_${m.getLatLng().lng.toFixed(6)}`)
      );

      if (positions.size === 1) {
        const [locationKey] = positions;
        const eventsAtLocation = groupedEvents.get(locationKey) ?? [];

        // Remove any stale moveend listener before binding a new one
        if (pendingMoveEndRef.current) {
          map.off('moveend', pendingMoveEndRef.current);
          pendingMoveEndRef.current = null;
        }

        const clusterCenter = cluster.getAllChildMarkers()[0].getLatLng();
        const currentZoom = map.getZoom();

        const onMoveEnd = () => {
          pendingMoveEndRef.current = null;
          onMultiMarkerClick(eventsAtLocation);
        };

        pendingMoveEndRef.current = onMoveEnd;
        map.once('moveend', onMoveEnd);
        map.flyTo(clusterCenter, currentZoom);
      } else {
        sendGAEvent('event', 'map_cluster_zoom_in', {
          event_page: '/map-new/[artistId]',
          user_id: user?.uid ?? '',
          content_id: artistId,
        });
        map.fitBounds(cluster.getBounds(), { animate: true, maxZoom: 16, padding: [20, 20] });
        onClearSelection();
      }
    },
    [map, groupedEvents, onMultiMarkerClick, onClearSelection, user, artistId]
  );

  const handleMarkerClick = useCallback(
    (event: MapEvent) => {
      onSingleMarkerClick(event);
    },
    [onSingleMarkerClick]
  );

  return (
    <MarkerClusterGroup
      maxClusterRadius={80}
      disableClusteringAtZoom={20}
      spiderfyOnMaxZoom={false}
      zoomToBoundsOnClick={false}
      eventHandlers={{
        clusterclick: handleClusterClick,
      }}
      iconCreateFunction={createClusterIcon}
    >
      {mapEvents.map((event) => {
        const isSelected = selectedEventId === event.id;
        const cacheKey = `${event.mainImage || 'default'}_${isSelected}`;
        const cachedIcon = markerIcons.get(cacheKey);

        if (!cachedIcon) return null;

        return (
          <MemoizedMarker
            key={event.id}
            event={event}
            icon={cachedIcon}
            onMarkerClick={handleMarkerClick}
          />
        );
      })}
    </MarkerClusterGroup>
  );
};

export default MarkerLayer;
