'use client';

import { useRef, useState, useEffect } from 'react';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { QueueListIcon, CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import EventCarousel from './EventCarousel';
import { useBottomSheet } from './hooks/useBottomSheet';

const drawerContainer = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '600px',
  mx: 'auto',
  background: 'color.background.secondary',
  borderRadius: '16px 16px 0 0',
  boxShadow: '0 -4px 20px var(--colors-alpha-black-15)',
  overflow: 'hidden',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  paddingX: '4',
});

const handleBarArea = css({
  display: 'flex',
  alignItems: 'center',
  paddingTop: '4',
  paddingBottom: '4',
  flexShrink: 0,
  cursor: 'grab',
  userSelect: 'none',
  touchAction: 'none',
});

const handleBarCenter = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5',
});

const handleBar = css({
  width: '36px',
  height: '4px',
  borderRadius: 'radius.sm',
  background: 'color.border.medium',
});

const countText = css({
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  lineHeight: '1',
  marginTop: '3',
});

const locationChip = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  paddingX: '3',
  paddingY: '1.5',
  borderRadius: '9999px',
  background: 'color.background.tertiary',
  border: '1px solid',
  borderColor: 'color.border.light',
  maxWidth: '250px',
});

const locationChipText = css({
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const locationChipClose = css({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  color: 'color.text.secondary',
  background: 'none',
  border: 'none',
  padding: '2',
  margin: '-2',
  cursor: 'pointer',
  lineHeight: '1',
});

const sideSlot = css({
  width: '32px',
  flexShrink: 0,
});

const listButton = css({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  borderRadius: 'radius.md',
  cursor: 'pointer',
  color: 'color.text.secondary',
  flexShrink: 0,
  _hover: {
    background: 'color.background.hover',
    color: 'color.text.primary',
  },
});

// Empty state
const emptyPanel = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '600px',
  mx: 'auto',
  background: 'color.background.secondary',
  borderRadius: '16px 16px 0 0',
  boxShadow: '0 -4px 20px var(--colors-alpha-black-15)',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingX: '4',
  paddingBottom: '8',
});

const emptyHandleBar = css({
  width: '36px',
  height: '4px',
  borderRadius: 'radius.sm',
  background: 'color.border.medium',
  marginTop: '4',
  marginBottom: '5',
});

const emptyContent = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2',
});

const emptyIcon = css({
  color: 'color.text.disabled',
});

const emptyTitle = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const emptyDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  textAlign: 'center',
  whiteSpace: 'pre-line',
});

export interface MapBottomSheetProps {
  events: MapEvent[];
  onRequestListMode: () => void;
  isLocationFiltered?: boolean;
  onClearLocationFilter?: () => void;
}

const MapBottomSheet = ({
  events,
  onRequestListMode,
  isLocationFiltered,
  onClearLocationFilter,
}: MapBottomSheetProps) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMeasuredHeight(el.scrollHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Hook must be called unconditionally (React rules); empty state ignores height/drag values
  const { height, isAnimating, isHalfOpen, handleBarBind, onTransitionEnd, snapToHalf } =
    useBottomSheet({
      onRequestListMode,
      halfHeight: measuredHeight,
    });

  // Auto-open to half when a location filter is applied
  useEffect(() => {
    if (isLocationFiltered) {
      snapToHalf();
    }
  }, [isLocationFiltered, snapToHalf]);

  if (events.length === 0) {
    return (
      <div className={emptyPanel}>
        <div className={emptyHandleBar} />
        <div className={emptyContent}>
          <CalendarDaysIcon width={32} height={32} className={emptyIcon} />
          <p className={emptyTitle}>目前沒有生日應援活動</p>
          <p className={emptyDesc}>這位藝人目前還沒有生日應援，{'\n'}等活動上架後再來看看吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={drawerContainer}
      style={{
        height: `${height}px`,
        transition: isAnimating ? 'height 0.3s ease-out' : 'none',
      }}
      onTransitionEnd={onTransitionEnd}
    >
      {/* paddingBottom ensures scrollHeight naturally includes bottom spacing */}
      <div ref={innerRef} style={{ paddingBottom: '16px' }}>
        <div className={handleBarArea} {...handleBarBind}>
          <div className={sideSlot} />

          <div className={handleBarCenter}>
            {isLocationFiltered && onClearLocationFilter ? (
              <div
                className={locationChip}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <span className={locationChipText}>
                  {events[0]?.location?.name ?? events[0]?.location?.city ?? ''}
                </span>
                <button
                  type="button"
                  className={locationChipClose}
                  aria-label="清除地點篩選"
                  onClick={onClearLocationFilter}
                >
                  <XMarkIcon width={14} height={14} />
                </button>
              </div>
            ) : (
              <div className={handleBar} />
            )}
            <span className={countText}>{events.length} 個生日應援</span>
          </div>

          {isHalfOpen ? (
            <button
              className={listButton}
              type="button"
              aria-label="切換列表模式"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRequestListMode();
              }}
            >
              <QueueListIcon width={20} height={20} />
            </button>
          ) : (
            <div className={sideSlot} />
          )}
        </div>

        <EventCarousel events={events} />
      </div>
    </div>
  );
};

export default MapBottomSheet;
