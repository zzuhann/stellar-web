import { sendGAEvent } from '@next/third-parties/google';

const VENUES_LIST_EVENT_PAGE = '/venues';
const VENUE_DETAIL_EVENT_PAGE = '/venues/[id]';

type VenueAnalyticsPayload = Record<string, string | number>;

interface VenueEventBaseParams {
  userId?: string;
}

interface VenueCardEventParams extends VenueEventBaseParams {
  venueId: string;
  venueRegion: string;
  listPosition: number;
  // Phase 2.8: currently-effective list sort ('composite' | 'newest' | 'eventCount').
  // Only meaningful for the /venues list page; the homepage card variant has no sort
  // semantics (fixed sort=random), so HomeVenueCardEventParams omits it below.
  listSort: string;
}

type HomeVenueCardEventParams = Omit<VenueCardEventParams, 'userId' | 'listSort'>;

interface VenueFilterEventParams extends VenueEventBaseParams {
  filterRegion: string;
  filterCapacity: string;
  searchQuery: string;
  resultCount: number;
}

interface ResolveVenueGeolocationEventParams extends VenueEventBaseParams {
  locationResult: 'granted' | 'denied' | 'unsupported' | 'timeout';
  source: 'menu_select' | 'share_link';
}

interface VenueSortEventParams extends VenueEventBaseParams {
  sortFrom: string;
  sortTo: string;
  filterRegion: string;
  filterCapacity: string;
  searchQuery: string;
  resultCount: number;
}

interface VenueContactEventParams extends VenueEventBaseParams {
  venueId: string;
  contactType: string;
}

interface VenueMapEventParams extends VenueEventBaseParams {
  venueId: string;
}

interface VenueEventDetailEventParams extends VenueEventBaseParams {
  eventId: string;
}

function trackVenueEvent(eventName: string, payload: VenueAnalyticsPayload) {
  sendGAEvent('event', eventName, payload);
}

export function toVenueContentId(venueId: string): string {
  return `venue_${venueId}`;
}

export function trackViewVenueCard({
  userId,
  venueId,
  venueRegion,
  listPosition,
  listSort,
}: VenueCardEventParams) {
  trackVenueEvent('view_venue_card', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
    list_sort: listSort,
  });
}

export function trackClickVenueDetail({
  userId,
  venueId,
  venueRegion,
  listPosition,
  listSort,
}: VenueCardEventParams) {
  trackVenueEvent('click_venue_detail', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
    list_sort: listSort,
  });
}

export function trackViewHomeVenueCard({
  venueId,
  venueRegion,
  listPosition,
}: HomeVenueCardEventParams) {
  trackVenueEvent('view_venue_card', {
    event_page: '/',
    placement: 'homepage_random',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
  });
}

export function trackClickHomeVenueDetail({
  venueId,
  venueRegion,
  listPosition,
}: HomeVenueCardEventParams) {
  trackVenueEvent('click_venue_detail', {
    event_page: '/',
    placement: 'homepage_random',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
  });
}

export function trackClickVenueListCta() {
  trackVenueEvent('click_venue_list_cta', {
    event_page: '/',
    placement: 'homepage_random',
  });
}

export function trackFilterVenues({
  userId,
  filterRegion,
  filterCapacity,
  searchQuery,
  resultCount,
}: VenueFilterEventParams) {
  trackVenueEvent('filter_venues', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: '',
    filter_region: filterRegion,
    filter_capacity: filterCapacity,
    search_query: searchQuery,
    result_count: resultCount,
  });
}

export function trackSortVenues({
  userId,
  sortFrom,
  sortTo,
  filterRegion,
  filterCapacity,
  searchQuery,
  resultCount,
}: VenueSortEventParams) {
  trackVenueEvent('sort_venues', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: '',
    sort_from: sortFrom,
    sort_to: sortTo,
    filter_region: filterRegion,
    filter_capacity: filterCapacity,
    search_query: searchQuery,
    result_count: resultCount,
  });
}

// 距離排序定位授權結果（venue-distance-sort 新增）。不得帶座標、距離數值或 accuracy
// ——隱私硬規則見 tracking.md「隱私硬規則」，payload 只允許 location_result/source 兩個值。
export function trackResolveVenueGeolocation({
  userId,
  locationResult,
  source,
}: ResolveVenueGeolocationEventParams) {
  trackVenueEvent('resolve_venue_geolocation', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: '',
    location_result: locationResult,
    source,
  });
}

export function trackClickVenueContact({ userId, venueId, contactType }: VenueContactEventParams) {
  trackVenueEvent('click_venue_contact', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    contact_type: contactType,
  });
}

export function trackClickVenueMap({ userId, venueId }: VenueMapEventParams) {
  trackVenueEvent('click_venue_map', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    outbound_target: 'google_maps',
  });
}

export function trackClickEventDetail({ userId, eventId }: VenueEventDetailEventParams) {
  trackVenueEvent('click_event_detail', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: eventId,
  });
}
