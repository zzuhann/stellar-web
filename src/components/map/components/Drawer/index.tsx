import { css } from '@/styled-system/css';
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
  boxShadow: '0 -4px 20px var(--colors-alpha-black-15)',
  zIndex: '100',
  overflow: 'hidden',
});

type DrawerProps = {
  style: {
    height: number;
    transition: string;
  };
  bind: {
    handleMouseDown: (e: React.MouseEvent) => void;
    handleTouchStart: (e: React.TouchEvent) => void;
  };
  artistData: Artist | null;
  mapEvents: MapEvent[];
};

const Drawer = ({ style, bind, artistData, mapEvents }: DrawerProps) => {
  return (
    <div
      className={drawerContainer}
      style={{ height: style.height, transition: style.transition }}
      data-drawer
    >
      <LocationButton />
      <DrawerHandleBar bind={bind} artistData={artistData} mapEvents={mapEvents} />
      <DrawerContent mapEvents={mapEvents} artistData={artistData ?? null} />
    </div>
  );
};

export default Drawer;
