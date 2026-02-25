import { css } from '@/styled-system/css';
import useMapSelection from '../../hook/useMapSelection';
import { Artist } from '@/types';
import { MapEvent } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMapStore } from '@/store';

const drawerHandle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '90px',
  cursor: 'grab',
  gap: '12px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  background: 'color.background.primary',
  userSelect: 'none',
  touchAction: 'none',
  position: 'relative',
  '&:active': {
    cursor: 'grabbing',
  },
});

const handleBarTextContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const handleBarText = css({
  fontSize: '14px',
  color: 'color.text.primary',
});

const handleBar = css({
  width: '40px',
  height: '4px',
  background: 'color.border.medium',
  borderRadius: '2px',
});

const closeButton = css({
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '32px',
  height: '32px',
  borderRadius: 'radius.circle',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  zIndex: '10',
  '&:hover': {
    background: 'color.background.tertiary',
    borderColor: 'color.border.medium',
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
});

type DrawerHandleBarProps = {
  bind: {
    handleMouseDown: (e: React.MouseEvent) => void;
    handleTouchStart: (e: React.TouchEvent) => void;
  };
  artistData: Artist | null;
  mapEvents: MapEvent[];
};

const DrawerHandleBar = ({ bind, artistData, mapEvents }: DrawerHandleBarProps) => {
  const { selectedEventId } = useMapStore();

  const { selectedLocationEvents, isLocationSelected, handleCloseButtonClick } = useMapSelection();

  return (
    <div
      className={drawerHandle}
      onMouseDown={bind.handleMouseDown}
      onTouchStart={bind.handleTouchStart}
      role="slider"
      aria-label="拖曳調整高度"
      aria-orientation="vertical"
      tabIndex={0}
    >
      <div className={handleBar} aria-hidden="true" />
      <div className={handleBarTextContainer}>
        <p className={handleBarText}>
          {selectedEventId ? (
            '目前查看中的生日應援'
          ) : isLocationSelected ? (
            `此地點有 ${selectedLocationEvents.length} 個生日應援`
          ) : (
            <>
              {artistData?.stageName?.toUpperCase()} {artistData?.realName} |{' '}
              {mapEvents.length > 0 ? `${mapEvents.length} 個生日應援` : '目前沒有生日應援'}
            </>
          )}
        </p>
      </div>
      {(selectedEventId || isLocationSelected) && (
        <button
          className={closeButton}
          onClick={handleCloseButtonClick}
          type="button"
          aria-label="關閉查看中的生日應援"
        >
          <XMarkIcon width={20} height={20} color="color.text.primary" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default DrawerHandleBar;
