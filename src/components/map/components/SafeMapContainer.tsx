import { MapContainer as LeafletMapContainer, MapContainerProps } from 'react-leaflet';

const SafeMapContainer = ({ children, ...props }: MapContainerProps) => {
  return <LeafletMapContainer {...props}>{children}</LeafletMapContainer>;
};

export default SafeMapContainer;
