'use client';

import { css } from '@/styled-system/css';
import useMapPageData from '../hook/useMapPageData';
import useMapHeaderTitle from '../hook/useMapHeaderTitle';
import MapEmptyState from '../MapEmptyState';
import ViewSwitch from '../ViewSwitch';
import OverviewEventCard from './OverviewEventCard';

// Header is fixed at 70px
const page = css({
  maxWidth: '600px',
  minHeight: '100dvh',
  mx: 'auto',
  paddingTop: '70px',
  paddingBottom: 'calc({spacing.6} + env(safe-area-inset-bottom))',
  background: 'color.background.primary',
});

const switchArea = css({
  paddingY: '3',
});

const count = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  paddingX: '4',
  marginBottom: '3',
});

const grid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  columnGap: '2',
  rowGap: '4',
  paddingX: '4',
  margin: '0',
  listStyle: 'none',
});

const gridItem = css({
  minWidth: '0',
});

const emptyArea = css({
  paddingY: '10',
  paddingX: '4',
});

// Poster images in the first row are the LCP candidates
const PRIORITY_COUNT = 3;

interface MapOverviewProps {
  // Route param (slug, or id when the artist has no slug)
  artistId: string;
}

export default function MapOverview({ artistId }: MapOverviewProps) {
  const { mapEvents, isMapLoading, artistData } = useMapPageData({ artistId });
  useMapHeaderTitle(artistData);

  const showEmpty = !isMapLoading && mapEvents.length === 0;

  return (
    <div className={page} id="main-content">
      <div className={switchArea}>
        <ViewSwitch artistId={artistId} current="overview" />
      </div>
      {showEmpty ? (
        <div className={emptyArea}>
          <MapEmptyState />
        </div>
      ) : (
        mapEvents.length > 0 && (
          <>
            <p className={count}>{`${mapEvents.length} 間生咖`}</p>
            <ul className={grid}>
              {mapEvents.map((event, index) => (
                <li key={event.id} className={gridItem}>
                  <OverviewEventCard
                    event={event}
                    artistId={artistData?.id ?? artistId}
                    priority={index < PRIORITY_COUNT}
                  />
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </div>
  );
}
