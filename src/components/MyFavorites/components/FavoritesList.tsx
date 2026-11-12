import Link from 'next/link';
import { css } from '@/styled-system/css';
import OverviewEventCard from '@/components/map/overview/OverviewEventCard';
import type { CoffeeEvent } from '@/types';

const grid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  columnGap: '2',
  rowGap: '4',
  margin: '0',
  listStyle: 'none',
});
const gridItem = css({ minWidth: '0' });
const button = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  paddingX: '4',
  marginTop: '4',
  textStyle: 'button',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.md',
  color: 'color.primary',
  cursor: 'pointer',
  '&:hover, &:active': { background: 'color.background.secondary' },
});
const empty = css({
  textAlign: 'center',
  paddingY: '10',
  textStyle: 'body',
  color: 'color.text.secondary',
});

interface Props {
  events: CoffeeEvent[];
  artistId: string;
  hasFavorites: boolean;
  onReset: () => void;
}
export default function FavoritesList({ events, artistId, hasFavorites, onReset }: Props) {
  if (!events.length)
    return (
      <div className={empty}>
        <p>{hasFavorites ? '目前篩選沒有符合的生日應援' : '還沒有想去的生日應援'}</p>
        {hasFavorites ? (
          <button type="button" className={button} onClick={onReset}>
            重設篩選
          </button>
        ) : (
          <Link className={button} href="/">
            前往首頁找活動
          </Link>
        )}
      </div>
    );
  return (
    <ul className={grid} aria-label="想去的生日應援">
      {events.map((event, index) => (
        <li key={event.id} className={gridItem}>
          <OverviewEventCard
            event={event}
            artistId={artistId}
            source="favorites_grid"
            priority={index < 3}
          />
        </li>
      ))}
    </ul>
  );
}
