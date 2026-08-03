import { sendGAEvent } from '@next/third-parties/google';
import { describe, expect, it, vi } from 'vitest';
import {
  trackClickHomeVenueDetail,
  trackClickVenueListCta,
  trackFilterVenues,
  trackViewHomeVenueCard,
} from './venues';

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));

describe('首頁場地 GA events', () => {
  it('曝光、點擊與 CTA 都標記 homepage_random placement', () => {
    const cardParams = { venueId: 'venue-1', venueRegion: '台北', listPosition: 2 };

    trackViewHomeVenueCard(cardParams);
    trackClickHomeVenueDetail(cardParams);
    trackClickVenueListCta();

    expect(sendGAEvent).toHaveBeenNthCalledWith(1, 'event', 'view_venue_card', {
      event_page: '/',
      placement: 'homepage_random',
      content_id: 'venue_venue-1',
      venue_region: '台北',
      list_position: 2,
    });
    expect(sendGAEvent).toHaveBeenNthCalledWith(2, 'event', 'click_venue_detail', {
      event_page: '/',
      placement: 'homepage_random',
      content_id: 'venue_venue-1',
      venue_region: '台北',
      list_position: 2,
    });
    expect(sendGAEvent).toHaveBeenNthCalledWith(3, 'event', 'click_venue_list_cta', {
      event_page: '/',
      placement: 'homepage_random',
    });
  });
});

describe('trackFilterVenues', () => {
  it('送出 search_query，既有 filter_region/filter_capacity/result_count 不受影響', () => {
    trackFilterVenues({
      userId: 'user-1',
      filterRegion: '台北',
      filterCapacity: '20-40',
      searchQuery: 'ABC Mart',
      resultCount: 5,
    });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'filter_venues', {
      event_page: '/venues',
      user_id: 'user-1',
      content_id: '',
      filter_region: '台北',
      filter_capacity: '20-40',
      search_query: 'ABC Mart',
      result_count: 5,
    });
  });
});
