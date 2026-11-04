'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import { useRandomVenuesQuery } from '@/hooks/useHomePage';
import { trackClickVenueListCta } from '@/lib/analytics/venues';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';
import { useVenueCardTagDictionary } from '@/components/venues/hooks/useVenueCardTagDictionary';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
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
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  '@media (min-width: 768px)': { gridAutoColumns: '260px' },
});
const skeleton = css({ scrollSnapAlign: 'start' });
// Fixed slot so the bar appearing after load does not shift the section
const progressSlot = css({ height: '3px', marginTop: '2', marginX: '1' });

const HomeVenuesSection = () => {
  const { data: venues = [], isPending: isVenuesPending, isError } = useRandomVenuesQuery(10);
  const { dictionary, isPending: isDictionaryPending } = useVenueCardTagDictionary();
  const listRef = useRef<HTMLUListElement>(null);
  // Cards wait for the dictionary so card_tags matches what is shown; a failed one settles too
  const isPending = isVenuesPending || isDictionaryPending;
  const { overflows, progress } = useHorizontalScroll(listRef, isPending ? 0 : venues.length);

  // hide the whole section (title included) when the API fails or returns nothing
  if (isError || (!isVenuesPending && venues.length === 0)) {
    return null;
  }

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
              <VenueCardSkeleton variant="home" />
            </div>
          ))}
        </div>
      )}

      {!isPending && (
        <ul ref={listRef} className={list} aria-label="隨機推薦場地">
          {venues.map((venue, index) => (
            <li key={venue.id}>
              <HomeVenueCard venue={venue} listPosition={index + 1} dictionary={dictionary} />
            </li>
          ))}
        </ul>
      )}

      <div className={progressSlot}>{overflows && <ScrollProgressBar value={progress} />}</div>
    </section>
  );
};

export default HomeVenuesSection;
