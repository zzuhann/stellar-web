import { Icon } from 'leaflet';

// 用戶位置圖標 - 安全的客戶端創建
export const createUserLocationIcon = () => {
  if (typeof window === 'undefined') {
    // 在服務端返回 null，避免 btoa 錯誤
    return null;
  }

  try {
    return new Icon({
      iconUrl:
        'data:image/svg+xml;base64,' +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
          <circle cx="12" cy="12" r="8" fill="#3B82F6" opacity="0.3"/>
          <circle cx="12" cy="12" r="4" fill="#3B82F6"/>
        </svg>
      `),
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  } catch {
    // 如果創建失敗，返回 null
    return null;
  }
};
