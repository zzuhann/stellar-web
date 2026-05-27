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
}

interface VenueFilterEventParams extends VenueEventBaseParams {
  filterRegion: string;
  filterCapacity: string;
  resultCount: number;
}

interface VenueContactEventParams extends VenueEventBaseParams {
  venueId: string;
  contactType: string;
}

interface VenueMapEventParams extends VenueEventBaseParams {
  venueId: string;
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
}: VenueCardEventParams) {
  trackVenueEvent('view_venue_card', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
  });
}

export function trackClickVenueDetail({
  userId,
  venueId,
  venueRegion,
  listPosition,
}: VenueCardEventParams) {
  trackVenueEvent('click_venue_detail', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: toVenueContentId(venueId),
    venue_region: venueRegion,
    list_position: listPosition,
  });
}

export function trackFilterVenues({
  userId,
  filterRegion,
  filterCapacity,
  resultCount,
}: VenueFilterEventParams) {
  trackVenueEvent('filter_venues', {
    event_page: VENUES_LIST_EVENT_PAGE,
    user_id: userId ?? '',
    content_id: '',
    filter_region: filterRegion,
    filter_capacity: filterCapacity,
    result_count: resultCount,
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
