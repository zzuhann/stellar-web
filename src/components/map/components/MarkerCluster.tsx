import { useRef } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import useMapSelection from '../hook/useMapSelection';
import useMapMarkers from '../hook/useMapMarkers';
import { Artist, MapEvent } from '@/types';
import { DivIcon, Point } from 'leaflet';
import { useMapStore } from '@/store/useMapStore';
import MemoizedMarker from './MemoizedMarker';

type MarkerClusterProps = {
  mapEvents: MapEvent[];
  artistData: Artist | null;
};

/* Marker 聚合群組 */
const MarkerCluster = ({ mapEvents, artistData }: MarkerClusterProps) => {
  const clusterGroupRef = useRef<typeof MarkerClusterGroup | null>(null);
  const selectedEventId = useMapStore((state) => state.selectedEventId);
  const { handleMarkerClick, handleClusterClick } = useMapSelection();
  const { groupedEvents, markerIcons } = useMapMarkers({ mapEvents });

  return (
    <MarkerClusterGroup
      ref={clusterGroupRef}
      // 控制聚合行為的選項
      maxClusterRadius={80} // 聚合半徑 (像素)，預設 80
      disableClusteringAtZoom={20} // 在最大縮放等級才停用聚合，讓同地點的活動始終聚合
      spiderfyOnMaxZoom={false} // 停用 spiderfy，讓同地點的活動保持聚合
      eventHandlers={{
        clusterclick: (event: {
          layer: { getBounds(): { getCenter(): { lat: number; lng: number } } };
          originalEvent: { preventDefault(): void; stopPropagation(): void };
        }) => handleClusterClick(event, groupedEvents),
      }}
      iconCreateFunction={(cluster: { getChildCount(): number }) => {
        const count = cluster.getChildCount();

        // 決定 cluster 大小
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

        // 如果有 artist profileImage，使用自定義樣式
        if (artistData?.profileImage) {
          const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-image: url('${artistData.profileImage}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background: rgba(0, 0, 0, 0.2);
        // backdrop-filter: blur(2px);
        color: #fff;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      ">
        ${count}
      </div>
    </div>
  `;

          return new DivIcon({
            html: html,
            className: '',
            iconSize: new Point(size, size),
            iconAnchor: [size / 2, size / 2],
          });
        }

        // 預設樣式（沒有 artist profileImage 時）
        return new DivIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: new Point(size, size),
        });
      }}
    >
      {mapEvents.map((event) => {
        const isSelected = selectedEventId === event.id;
        const cacheKey = `${event.mainImage || 'default'}_${isSelected}`;
        const cachedIcon = markerIcons.get(cacheKey);

        // 如果圖標不存在，跳過這個 marker
        if (!cachedIcon) {
          return null;
        }

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

export default MarkerCluster;
