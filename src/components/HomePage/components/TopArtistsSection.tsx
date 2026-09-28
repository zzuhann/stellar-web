import { useMemo, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import TopArtistCarousel from './TopArtistCarousel';
import { useTopArtistsQuery } from '@/hooks/useHomePage';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';
import { useSearchModalStore } from '@/store/useSearchModalStore';
import { shouldShowBirthdayHat } from '@/utils/birthdayHelpers';
import { TopArtist } from '@/lib/api';

// h2 and the pill are siblings on purpose, else nesting the pill inside <h2> leaks "搜尋藝人" into the heading's accessible name.
const titleRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  rowGap: '2',
});

const heading = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  minWidth: '0',
});

// A single margin-left:auto pushes the pill right both on the shared row and, once wrapped at 375px, on its own row.
const searchPill = css({
  position: 'relative',
  marginLeft: 'auto',
  flexShrink: '0',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  paddingX: '2.5',
  paddingY: '1',
  borderRadius: '9999px',
  background: 'color.background.primary',
  color: 'color.primary',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  // Expand the tap target to 44px without inflating the pill's visual size (title-row siblings are on the same line, so vertical-only extension can't cover them).
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2',
    bottom: '-2',
    left: '0',
    right: '0',
  },
  '&:hover': {
    background: 'stellarBlue.50',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const container = css({
  marginTop: '5',
  marginBottom: '5',
});

export default function TopArtistsSection() {
  const { data: artists = [], isLoading } = useTopArtistsQuery(50);
  const { user } = useAuth();
  const searchPillRef = useRef<HTMLButtonElement>(null);
  const openSearchModal = useSearchModalStore((state) => state.open);

  const sortedArtists = useMemo(() => {
    const today: TopArtist[] = [];
    const others: TopArtist[] = [];
    artists.forEach((a) => {
      if (shouldShowBirthdayHat(a.birthday ?? '')) {
        today.push(a);
      } else {
        others.push(a);
      }
    });
    return [...today, ...others];
  }, [artists]);

  const handleCardClick = (artistId: string) => {
    sendGAEvent('event', 'click_top_artist', {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: artistId,
    });
  };

  if (!isLoading && artists.length === 0) {
    return null;
  }

  return (
    <section className={container} aria-label="擁有最多即將到來的生咖的藝人或團體">
      <div className={titleRow}>
        <h2 className={heading}>🧚 擁有最多即將到來的生咖</h2>
        <button
          ref={searchPillRef}
          type="button"
          className={searchPill}
          onClick={() => openSearchModal('top_artists', searchPillRef)}
        >
          <MagnifyingGlassIcon width={18} height={18} aria-hidden="true" />
          搜尋藝人
        </button>
      </div>
      <TopArtistCarousel
        artists={sortedArtists}
        isLoading={isLoading}
        onCardClick={handleCardClick}
      />
    </section>
  );
}
