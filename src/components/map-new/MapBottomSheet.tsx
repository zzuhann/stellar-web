'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';

const useClientLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { sendGAEvent } from '@next/third-parties/google';
import { css } from '@/styled-system/css';
import { MapEvent } from '@/types';
import { QueueListIcon, CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import EventCarousel from './EventCarousel';
import { useBottomSheet } from './hooks/useBottomSheet';
import Skeleton from '@/components/ui/Skeleton';

const drawerContainer = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '600px',
  mx: 'auto',
  overflow: 'hidden',
  zIndex: '10',
  pointerEvents: 'none',
});

const drawerInner = css({
  background: 'color.background.secondary',
  borderRadius: '16px 16px 0 0',
  boxShadow: '0 -4px 20px var(--colors-alpha-black-15)',
  display: 'flex',
  flexDirection: 'column',
  paddingX: '4',
  pointerEvents: 'auto',
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

const skeletonCarouselCard = css({
  display: 'flex',
  flexDirection: 'column',
  width: '230px',
  flexShrink: 0,
  gap: '2',
  padding: '2',
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'color.border.light',
});

export interface MapBottomSheetProps {
  artistId: string;
  events: MapEvent[];
  onRequestListMode: (triggerMethod: 'drag' | 'list_button') => void;
  isLocationFiltered?: boolean;
  onClearLocationFilter?: () => void;
  onHeightChange?: (h: number) => void;
  isLoading?: boolean;
}

const MapBottomSheet = ({
  artistId,
  events,
  onRequestListMode,
  isLocationFiltered,
  onClearLocationFilter,
  onHeightChange,
  isLoading,
}: MapBottomSheetProps) => {
  const { user } = useAuth();
  const innerRef = useRef<HTMLDivElement>(null);
  const locationChipRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Runs before first paint on client; initializing in useState would cause SSR/client mismatch
  useClientLayoutEffect(() => {
    setMaxHeight(Math.round(window.innerHeight * 0.9));
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMeasuredHeight(el.scrollHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleExpandToHalf = useCallback(
    (triggerMethod: 'drag' | 'tap_handle') => {
      sendGAEvent('event', 'map_bottom_sheet_expand', {
        event_page: '/map-new/[artistId]',
        user_id: user?.uid ?? '',
        content_id: artistId,
        trigger_method: triggerMethod,
      });
    },
    [user, artistId]
  );

  // Hook must be called unconditionally (React rules); empty state ignores height/drag values
  const { height, isAnimating, isHalfOpen, handleBarBind, onTransitionEnd, snapToHalf } =
    useBottomSheet({
      onRequestListMode,
      onExpandToHalf: handleExpandToHalf,
      halfHeight: measuredHeight,
      excludeRef: locationChipRef,
    });

  useEffect(() => {
    onHeightChange?.(height);
  }, [height, onHeightChange]);

  // Auto-open to half when a location filter is applied
  const isLocationFilteredRef = useRef(false);
  useEffect(() => {
    if (isLocationFiltered && !isLocationFilteredRef.current) {
      snapToHalf();
      sendGAEvent('event', 'map_bottom_sheet_expand', {
        event_page: '/map-new/[artistId]',
        user_id: user?.uid ?? '',
        content_id: artistId,
        trigger_method: 'location_filter',
      });
    }
    isLocationFilteredRef.current = !!isLocationFiltered;
  }, [isLocationFiltered, snapToHalf, user, artistId]);

  if (isLoading) {
    return (
      <div
        className={drawerContainer}
        style={{ height: maxHeight > 0 ? `${maxHeight}px` : undefined }}
      >
        <div
          className={drawerInner}
          style={{ transform: `translateY(${maxHeight > 0 ? maxHeight - 120 : 0}px)` }}
        >
          <div ref={innerRef} style={{ paddingBottom: '16px' }}>
            <div className={handleBarArea} {...handleBarBind}>
              <div className={sideSlot} />
              <div className={handleBarCenter}>
                <div className={handleBar} />
                <Skeleton width="80px" height="14px" borderRadius="4px" />
              </div>
              <div className={sideSlot} />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'hidden',
                paddingInline: '16px',
                paddingBottom: '8px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className={skeletonCarouselCard}>
                  <Skeleton
                    width="100%"
                    height="auto"
                    style={{ aspectRatio: '3/4' }}
                    borderRadius="8px"
                  />
                  <Skeleton width="90%" height="14px" borderRadius="4px" />
                  <Skeleton width="60%" height="12px" borderRadius="4px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const translateY = maxHeight > 0 ? maxHeight - height : 0;
  const transitionEasing = isAnimating ? 'ease-out' : 'ease-in';
  const transitionStyle = prefersReducedMotion
    ? 'none'
    : `transform ${isAnimating ? 250 : 200}ms ${transitionEasing}`;

  return (
    <div
      className={drawerContainer}
      data-testid="bottom-sheet"
      style={{ height: maxHeight > 0 ? `${maxHeight}px` : undefined }}
    >
      {/* Inner sheet slides up/down via translateY; transition removed during drag */}
      <div
        className={drawerInner}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isAnimating ? transitionStyle : 'none',
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {/* paddingBottom ensures scrollHeight naturally includes bottom spacing */}
        <div ref={innerRef} style={{ paddingBottom: '16px' }}>
          <div className={handleBarArea} data-testid="handle-bar-area" {...handleBarBind}>
            <div className={sideSlot} />

            <div className={handleBarCenter}>
              {isLocationFiltered && onClearLocationFilter ? (
                <div
                  ref={locationChipRef}
                  className={locationChip}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <span
                    className={locationChipText}
                    title={events[0]?.location?.name ?? events[0]?.location?.city ?? ''}
                  >
                    {events[0]?.location?.name ?? events[0]?.location?.city ?? ''}
                  </span>
                  <button
                    type="button"
                    className={locationChipClose}
                    aria-label="清除地點篩選"
                    onClick={() => {
                      sendGAEvent('event', 'map_location_filter_clear', {
                        event_page: '/map-new/[artistId]',
                        user_id: user?.uid ?? '',
                        content_id: artistId,
                      });
                      onClearLocationFilter?.();
                    }}
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
                  onRequestListMode('list_button');
                }}
              >
                <QueueListIcon width={20} height={20} />
              </button>
            ) : (
              <div className={sideSlot} />
            )}
          </div>

          <EventCarousel events={events} artistId={artistId} />
        </div>
      </div>
    </div>
  );
};

export default MapBottomSheet;
