import { MapContainer as LeafletMapContainer, MapContainerProps } from 'react-leaflet';
import { useEffect, useState } from 'react';

// 安全的 MapContainer 包裝器，防止在服務端渲染時出現問題
const SafeMapContainer = ({ children, ...props }: MapContainerProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ height: '100%', width: '100%' }} />;
  }

  return <LeafletMapContainer {...props}>{children}</LeafletMapContainer>;
};

export default SafeMapContainer;
