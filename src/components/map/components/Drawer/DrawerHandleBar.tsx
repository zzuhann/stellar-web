import { css } from '@/styled-system/css';
import { useEffect, useRef } from 'react';
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
  gap: '3',
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
  gap: '2',
});

const handleBarText = css({
  textStyle: 'bodySmall',
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
  top: '4',
  right: '4',
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
  const { selectedEventId, isDrawerExpanded, setIsDrawerExpanded } = useMapStore();
  const handleRef = useRef<HTMLDivElement>(null);

  const { selectedLocationEvents, isLocationSelected, handleCloseButtonClick } = useMapSelection();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDrawerExpanded(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDrawerExpanded(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDrawerExpanded(!isDrawerExpanded);
    }
  };

  // React 19 的 onTouchStart 是 passive listener，無法呼叫 preventDefault()
  // 手動以 { passive: false } 掛載，防止 touchend 後 browser 補發合成 mouse events
  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => bind.handleTouchStart(e as unknown as React.TouchEvent);

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
    };
  }, [bind.handleTouchStart]);

  return (
    <div
      ref={handleRef}
      className={drawerHandle}
      onMouseDown={bind.handleMouseDown}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label="調整活動列表高度"
      aria-orientation="vertical"
      aria-valuenow={isDrawerExpanded ? 100 : 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={isDrawerExpanded ? '展開' : '收合'}
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
