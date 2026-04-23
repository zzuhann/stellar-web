import { css } from '@/styled-system/css';
import TopArtistCarousel from './TopArtistCarousel';
import { useTopArtistsQuery } from '@/hooks/useHomePage';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const heading = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const container = css({
  marginTop: '5',
  marginBottom: '5',
});

export default function TopArtistsSection() {
  const { data: artists = [], isLoading } = useTopArtistsQuery(10);
  const { user } = useAuth();
  const router = useRouter();

  const handleCardClick = (artistId: string) => {
    sendGAEvent('event', 'click_top_artist', {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: artistId,
    });
  };

  const handleAddClick = () => {
    router.push('/submit-event');
  };

  return (
    <section className={container} aria-label="最多生咖的藝人或團體">
      <h2 className={heading}>🧚 擁有最多生咖</h2>
      <TopArtistCarousel
        artists={artists}
        isLoading={isLoading}
        onCardClick={handleCardClick}
        onAddClick={handleAddClick}
      />
    </section>
  );
}
