import { sendGAEvent } from '@next/third-parties/google';
import type { VenueEventTimeStatus } from '@/types';

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
  // Slugs actually shown on the card, comma-joined in display order; '' = none, 'dict_error' =
  // tag dictionary failed so the card shows no tags (tracking.md「card_tags 的值」)
  cardTags: string;
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

// sticky_bar: mobile bottom bar; side_card: desktop right-column card (venue-tags tracking.md)
export type VenueContactButtonLocation = 'sticky_bar' | 'side_card' | 'inline';

interface VenueContactEventParams extends VenueEventBaseParams {
  venueId: string;
  contactType: string;
  buttonLocation: VenueContactButtonLocation;
}

interface VenueEventDetailEventParams extends VenueEventBaseParams {
  eventId: string;
  eventTimeStatus: VenueEventTimeStatus | null;
}

interface VenueSourceLinkEventParams extends VenueEventBaseParams {
  venueId: string;
  listPosition: number; // 1-based
}

export type VenueCorrectionContactType = 'form' | 'instagram' | 'threads';

interface VenueCorrectionEventParams extends VenueEventBaseParams {
  venueId: string;
  contactType: VenueCorrectionContactType;
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
  cardTags,
}: VenueCardEventParams) {
  trackVenueEvent('view_venue_card', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
    list_sort: listSort,
    card_tags: cardTags,
  });
}

export function trackClickVenueDetail({
  userId,
  venueId,
  venueRegion,
  listPosition,
  listSort,
  cardTags,
}: VenueCardEventParams) {
  trackVenueEvent('click_venue_detail', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
    list_sort: listSort,
    card_tags: cardTags,
  });
}

export function trackViewHomeVenueCard({
  venueId,
  venueRegion,
  listPosition,
  cardTags,
}: HomeVenueCardEventParams) {
  trackVenueEvent('view_venue_card', {
    event_page: '/',
    placement: 'homepage_random',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
    card_tags: cardTags,
  });
}

export function trackClickHomeVenueDetail({
  venueId,
  venueRegion,
  listPosition,
  cardTags,
}: HomeVenueCardEventParams) {
  trackVenueEvent('click_venue_detail', {
    event_page: '/',
    placement: 'homepage_random',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
    card_tags: cardTags,
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
// ——隱私硬規則見 tracking.md「隱私硬規則」，payload 只允許 location_result/ui_source 兩個值（GA 參數 `source` 會覆蓋流量來源歸因，故送出時一律用 ui_source）。
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
    ui_source: source,
  });
}

export function trackClickVenueContact({
  userId,
  venueId,
  contactType,
  buttonLocation,
}: VenueContactEventParams) {
  trackVenueEvent('click_venue_contact', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    contact_type: contactType,
    button_location: buttonLocation,
  });
}

export function trackClickEventDetail({
  userId,
  eventId,
  eventTimeStatus,
}: VenueEventDetailEventParams) {
  trackVenueEvent('click_event_detail', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: eventId,
    event_time_status: eventTimeStatus ?? '',
  });
}

export function trackClickVenueSourceLink({
  userId,
  venueId,
  listPosition,
}: VenueSourceLinkEventParams) {
  trackVenueEvent('click_venue_source_link', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    list_position: listPosition,
  });
}

export function trackClickVenueCorrection({
  userId,
  venueId,
  contactType,
}: VenueCorrectionEventParams) {
  trackVenueEvent('click_venue_correction', {
    event_page: VENUE_DETAIL_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    contact_type: contactType,
  });
}
