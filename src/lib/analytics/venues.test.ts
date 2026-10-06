import { sendGAEvent } from '@next/third-parties/google';
import { describe, expect, it, vi } from 'vitest';
import {
  trackClickEventDetail,
  trackClickHomeVenueDetail,
  trackClickVenueDetail,
  trackClickVenueListCta,
  trackFilterVenues,
  trackResolveVenueGeolocation,
  trackSortVenues,
  trackViewHomeVenueCard,
  trackViewVenueCard,
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

describe('列表頁卡片曝光/點擊帶 list_sort（Phase 2.8）', () => {
  it('trackViewVenueCard 送出目前生效的 list_sort', () => {
    trackViewVenueCard({
      userId: 'user-1',
      venueId: 'venue-1',
      venueRegion: '台北',
      listPosition: 3,
      listSort: 'newest',
    });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'view_venue_card', {
      event_page: '/venues',
      user_id: 'user-1',
      content_id: 'venue_venue-1',
      venue_region: '台北',
      list_position: 3,
      list_sort: 'newest',
    });
  });

  it('trackClickVenueDetail 送出目前生效的 list_sort，未登入時 user_id 送空字串', () => {
    trackClickVenueDetail({
      venueId: 'venue-2',
      venueRegion: '高雄',
      listPosition: 1,
      listSort: 'composite',
    });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'click_venue_detail', {
      event_page: '/venues',
      user_id: '',
      content_id: 'venue_venue-2',
      venue_region: '高雄',
      list_position: 1,
      list_sort: 'composite',
    });
  });
});

describe('trackSortVenues（Phase 2.8 新增事件）', () => {
  it('送出 sort_from/sort_to 與當下的 filter/搜尋/結果數，content_id 沿用 filter_venues 的空字串寫法', () => {
    trackSortVenues({
      userId: 'user-1',
      sortFrom: 'composite',
      sortTo: 'newest',
      filterRegion: '台北',
      filterCapacity: '20-40',
      searchQuery: 'ABC',
      resultCount: 12,
    });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'sort_venues', {
      event_page: '/venues',
      user_id: 'user-1',
      content_id: '',
      sort_from: 'composite',
      sort_to: 'newest',
      filter_region: '台北',
      filter_capacity: '20-40',
      search_query: 'ABC',
      result_count: 12,
    });
  });

  it('未登入時 user_id 送空字串，sort_from/sort_to 不因未登入而受影響', () => {
    trackSortVenues({
      sortFrom: 'newest',
      sortTo: 'composite',
      filterRegion: '全部',
      filterCapacity: 'all',
      searchQuery: '',
      resultCount: 0,
    });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'sort_venues', {
      event_page: '/venues',
      user_id: '',
      content_id: '',
      sort_from: 'newest',
      sort_to: 'composite',
      filter_region: '全部',
      filter_capacity: 'all',
      search_query: '',
      result_count: 0,
    });
  });
});

// qa.md 情境 40：resolve_venue_geolocation（venue-distance-sort 新增事件）
describe('trackResolveVenueGeolocation（venue-distance-sort 新增事件）', () => {
  const combinations: Array<
    ['granted' | 'denied' | 'unsupported' | 'timeout', 'menu_select' | 'share_link']
  > = [
    ['granted', 'menu_select'],
    ['granted', 'share_link'],
    ['denied', 'menu_select'],
    ['denied', 'share_link'],
    ['unsupported', 'menu_select'],
    ['unsupported', 'share_link'],
    ['timeout', 'menu_select'],
    ['timeout', 'share_link'],
  ];

  it.each(combinations)(
    'location_result=%s, source=%s 正確帶出對應參數',
    (locationResult, source) => {
      trackResolveVenueGeolocation({ userId: 'user-1', locationResult, source });

      expect(sendGAEvent).toHaveBeenCalledWith('event', 'resolve_venue_geolocation', {
        event_page: '/venues',
        user_id: 'user-1',
        content_id: '',
        location_result: locationResult,
        source,
      });
    }
  );

  it('未登入時 user_id 送空字串', () => {
    trackResolveVenueGeolocation({ locationResult: 'granted', source: 'menu_select' });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'resolve_venue_geolocation', {
      event_page: '/venues',
      user_id: '',
      content_id: '',
      location_result: 'granted',
      source: 'menu_select',
    });
  });

  it('payload 白名單：不含座標、距離數值、accuracy 或任何非規格允許的鍵', () => {
    trackResolveVenueGeolocation({
      userId: 'user-1',
      locationResult: 'granted',
      source: 'share_link',
    });

    const payload = vi.mocked(sendGAEvent).mock.calls.at(-1)?.[2] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ['content_id', 'event_page', 'location_result', 'source', 'user_id'].sort()
    );
  });
});

describe('trackClickEventDetail', () => {
  it('送出場地詳情頁的 click_event_detail，content_id 為 eventId 本身（不加 venue_ 前綴）', () => {
    trackClickEventDetail({ userId: 'user-1', eventId: 'event-1' });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'click_event_detail', {
      event_page: '/venues/[id]',
      user_id: 'user-1',
      content_id: 'event-1',
    });
  });

  it('未登入時 user_id 送空字串', () => {
    trackClickEventDetail({ eventId: 'event-2' });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'click_event_detail', {
      event_page: '/venues/[id]',
      user_id: '',
      content_id: 'event-2',
    });
  });
});
