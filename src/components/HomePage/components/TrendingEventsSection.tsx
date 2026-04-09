import { css } from '@/styled-system/css';
import EventCardCarousel from '@/components/EventCardCarousel';
import { useTrendingEventsQuery } from '@/hooks/useHomePage';

const heading = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const container = css({
  marginTop: '5',
});

export default function TrendingEventsSection() {
  const { data: events = [], isLoading } = useTrendingEventsQuery(10);

  if (!isLoading && events.length === 0) {
    return null;
  }

  return (
    <section className={container} aria-label="熱門活動排行">
      <h2 className={heading}>🔥 熱門生咖、生日應援</h2>
      <EventCardCarousel events={events} isLoading={isLoading} />
    </section>
  );
}
