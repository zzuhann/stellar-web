'use client';

import Link from 'next/link';
import { css } from '@/styled-system/css';
import { useRandomVenuesQuery } from '@/hooks/useHomePage';
import { trackClickVenueListCta } from '@/lib/analytics/venues';
import Skeleton from '@/components/ui/Skeleton';
import HomeVenueCard from './HomeVenueCard';

const section = css({ marginTop: '5', marginBottom: '5' });
const headingRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  marginBottom: '3',
});
const heading = css({ textStyle: 'bodyStrong', color: 'color.text.primary' });
const viewAll = css({
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  textStyle: 'bodySmall',
  color: 'color.primary',
  textDecoration: 'none',
  _focusVisible: { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '2px' },
});
const list = css({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: '78%',
  alignItems: 'stretch',
  gap: '3',
  margin: '0',
  padding: '1',
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollSnapType: 'x mandatory',
  listStyle: 'none',
  '@media (min-width: 768px)': { gridAutoColumns: '260px' },
});
const skeleton = css({
  height: '260px',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  scrollSnapAlign: 'start',
});

const HomeVenuesSection = () => {
  const { data: venues = [], isPending, isError } = useRandomVenuesQuery(10);

  return (
    <section className={section} aria-labelledby="home-venues-heading">
      <div className={headingRow}>
        <h2 id="home-venues-heading" className={heading}>
          探索生咖場地
        </h2>
        <Link
          href="/venues"
          className={viewAll}
          aria-label="查看全部場地"
          onClick={trackClickVenueListCta}
        >
          查看全部 →
        </Link>
      </div>

      {isPending && (
        <div role="status" aria-label="場地載入中" className={list}>
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className={skeleton} aria-hidden="true">
              <Skeleton height="260px" borderRadius="0" />
            </div>
          ))}
        </div>
      )}

      {!isPending && !isError && venues.length > 0 && (
        <ul className={list} aria-label="隨機推薦場地">
          {venues.map((venue, index) => (
            <li key={venue.id}>
              <HomeVenueCard venue={venue} listPosition={index + 1} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HomeVenuesSection;
