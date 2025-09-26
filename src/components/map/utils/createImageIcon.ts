import { DivIcon } from 'leaflet';

// 創建自定義圖片 marker 的函數
export const createImageIcon = (imageUrl?: string, isSelected = false) => {
  try {
    // 預設圖片 (如果沒有 mainImage)
    const defaultImageUrl =
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" width="40" height="40">
        <path d="M2 21h18v-2H2v2zm1.15-4.05L4 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L8 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L12 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55L16 15.47l.85 1.48c.2.34.57.55.98.55s.78-.21.98-.55l.85-1.48-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L16 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L12 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55L8 14.53l-.85-1.48c-.2-.34-.57-.55-.98-.55s-.78.21-.98.55l-.85 1.48zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/>
      </svg>
    `);

    const size = isSelected ? 60 : 40;
    const borderWidth = isSelected ? 5 : 3;
    const backgroundImage = imageUrl || defaultImageUrl;

    const iconHtml = `
     <div style="
        position: absolute;
        bottom: ${isSelected ? -6 : 3}px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: ${isSelected ? 10 : 6}px solid transparent;
        border-right: ${isSelected ? 10 : 6}px solid transparent;
        border-top: ${isSelected ? 12 : 8}px solid white;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      "></div>
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${borderWidth}px solid white;
        overflow: hidden;
        background: white;
        position: relative;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      ">
        <div style="
          width: 100%;
          height: 100%;
          background-image: url('${backgroundImage}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: none;
          font-size: 20px;
        ">☕</div>
      </div>
    `;

    const totalHeight = size + 10;

    return new DivIcon({
      html: iconHtml,
      className: '',
      iconSize: [size, totalHeight],
      iconAnchor: [size / 2, totalHeight],
      popupAnchor: [0, -totalHeight],
    });
  } catch {
    // 返回一個簡單的默認圖標
    return new DivIcon({
      html: '<div style="width: 40px; height: 40px; background: #8B4513; border-radius: 50%; border: 3px solid white;"></div>',
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }
};
