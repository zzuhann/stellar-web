import { useMapStore } from '@/store';
import { MapEvent } from '@/types';

const useMapSelection = () => {
  const selectedEventId = useMapStore((state) => state.selectedEventId);
  const setSelectedEventId = useMapStore((state) => state.setSelectedEventId);
  const setIsDrawerExpanded = useMapStore((state) => state.setIsDrawerExpanded);
  const setCenter = useMapStore((state) => state.setCenter);
  const selectMarker = useMapStore((state) => state.selectMarker);
  const selectedLocationEvents = useMapStore((state) => state.selectedLocationEvents);
  const setSelectedLocationEvents = useMapStore((state) => state.setSelectedLocationEvents);
  const isLocationSelected = useMapStore((state) => state.isLocationSelected);
  const setIsLocationSelected = useMapStore((state) => state.setIsLocationSelected);

  // 處理地圖 marker 點擊
  const handleMarkerClick = (event: MapEvent) => {
    setCenter({
      lat: event.location.coordinates.lat,
      lng: event.location.coordinates.lng,
      zoom: 16,
    });
    selectMarker(event.id);
    setSelectedEventId(event.id);
    setIsLocationSelected(false); // 清除地點選擇狀態
    setIsDrawerExpanded(true);
  };

  // 處理地點點擊（當同地點有多個活動時）
  const handleLocationClick = (locationKey: string, events: MapEvent[]) => {
    setSelectedLocationEvents(events);
    setIsLocationSelected(true);
    setSelectedEventId(null); // 清除單一活動選擇
    setIsDrawerExpanded(true);
  };

  // 處理聚合點擊事件
  const handleClusterClick = (
    event: {
      layer: { getBounds(): { getCenter(): { lat: number; lng: number } } };
      originalEvent: { preventDefault(): void; stopPropagation(): void };
    },
    groupedEvents: Map<string, MapEvent[]>
  ) => {
    const cluster = event.layer;
    const clusterBounds = cluster.getBounds();
    const clusterCenter = clusterBounds.getCenter();

    // 阻止預設行為
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    // 找到該地點的所有活動
    const locationKey = `${clusterCenter.lat.toFixed(6)}_${clusterCenter.lng.toFixed(6)}`;
    const eventsAtLocation = groupedEvents.get(locationKey) || [];

    if (eventsAtLocation.length > 1) {
      // 如果同地點有多個活動，顯示列表
      handleLocationClick(locationKey, eventsAtLocation);
    } else if (eventsAtLocation.length === 1) {
      // 如果只有一個活動，直接選中
      const event = eventsAtLocation[0];
      handleMarkerClick(event);
    }
  };

  const handleCloseButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到 drawer

    // 先關閉 drawer，再清除選擇狀態
    setIsDrawerExpanded(false);

    if (selectedEventId) {
      setSelectedEventId(null);
    }
    if (isLocationSelected) {
      setIsLocationSelected(false);
      setSelectedLocationEvents([]);
    }
  };

  return {
    selectedLocationEvents,
    isLocationSelected,
    handleMarkerClick,
    handleLocationClick,
    handleClusterClick,
    handleCloseButtonClick,
  };
};

export default useMapSelection;
