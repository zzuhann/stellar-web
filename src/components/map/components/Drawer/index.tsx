import { css } from '@/styled-system/css';
import { animated, SpringValue } from '@react-spring/web';
import { Artist, MapEvent } from '@/types';
import LocationButton from '../LocationButton';
import DrawerHandleBar from './DrawerHandleBar';
import DrawerContent from './DrawerContent';

const drawerContainer = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  background: 'color.background.primary',
  borderRadius: '16px 16px 0 0',
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
  zIndex: '100',
});

type DrawerProps = {
  springs: {
    height: SpringValue<number>;
  };
  bind: {
    handleMouseDown: (e: React.MouseEvent) => void;
    handleTouchStart: (e: React.TouchEvent) => void;
  };
  artistData: Artist | null;
  mapEvents: MapEvent[];
};

const Drawer = ({ springs, bind, artistData, mapEvents }: DrawerProps) => {
  return (
    <animated.div className={drawerContainer} style={springs}>
      <LocationButton />
      <DrawerHandleBar bind={bind} artistData={artistData} mapEvents={mapEvents} />
      <DrawerContent mapEvents={mapEvents} artistData={artistData ?? null} />
    </animated.div>
  );
};

export default Drawer;
