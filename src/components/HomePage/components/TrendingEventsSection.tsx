import { css } from '@/styled-system/css';
import EventCardCarousel from '@/components/EventCardCarousel';
import { useTrendingEventsQuery } from '@/hooks/useHomePage';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

const heading = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const container = css({
  marginTop: '5',
});

export default function TrendingEventsSection() {
  const { data: events = [], isLoading } = useTrendingEventsQuery(10);
  const { user } = useAuth();

  const handleCardClick = (eventId: string) => {
    sendGAEvent('event', 'click_trending_event', {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: eventId,
    });
  };

  if (!isLoading && events.length === 0) {
    return null;
  }

  return (
    <section className={container} aria-label="熱門活動排行">
      <h2 className={heading}>🔥 熱門生咖、生日應援</h2>
      <EventCardCarousel events={events} isLoading={isLoading} onCardClick={handleCardClick} />
    </section>
  );
}
