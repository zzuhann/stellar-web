import { useState } from 'react';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import OverviewEventCard from '@/components/map/overview/OverviewEventCard';
import type { FavoriteGroup } from '@/utils/favoriteGroups';

const sections = css({ display: 'flex', flexDirection: 'column', gap: '8' });
const heading = css({ textStyle: 'h3', overflowWrap: 'anywhere', marginBottom: '3' });
const count = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  marginLeft: '2',
  whiteSpace: 'nowrap',
});
const grid = css({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '3' });
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
  groups: FavoriteGroup[];
  hasFavorites: boolean;
  onReset: () => void;
}
export default function FavoritesList({ groups, hasFavorites, onReset }: Props) {
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  if (!groups.length)
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
    <div className={sections}>
      {groups.map((group) => {
        const visible = visibleCounts[group.id] ?? 12;
        return (
          <section key={group.id} aria-label={group.name}>
            <h2 className={heading}>
              {group.name}
              <span className={count}>{group.events.length} 場</span>
            </h2>
            <div className={grid}>
              {group.events.slice(0, visible).map((event) => (
                <OverviewEventCard
                  key={event.id}
                  event={event}
                  artistId={group.id}
                  source="favorites_grid"
                />
              ))}
            </div>
            {visible < group.events.length && (
              <button
                type="button"
                className={button}
                aria-label={`顯示更多 ${group.name} 的活動`}
                onClick={() =>
                  setVisibleCounts((counts) => ({ ...counts, [group.id]: visible + 12 }))
                }
              >
                顯示更多
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
