import { Icon } from 'leaflet';

// 初始化 Leaflet 默認圖標
export const initializeLeafletIcons = () => {
  if (typeof window === 'undefined') return;

  try {
    // 確保 Icon.Default 存在
    if (!Icon.Default) {
      return;
    }

    // 刪除可能存在的 _getIconUrl 方法
    if (Icon.Default.prototype && '_getIconUrl' in Icon.Default.prototype) {
      delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    }

    // 設置默認圖標
    Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  } catch {}
};

// 創建一個安全的默認圖標
export const createSafeDefaultIcon = () => {
  try {
    return new Icon({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  } catch {
    return null;
  }
};
