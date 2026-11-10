import type { Venue, VenueTagDictionary } from '@/types';

// Only what the small related-venue card renders; the page passes these to the client
export interface RelatedVenueCard {
  id: string;
  name: string;
  coverPhoto: string | null;
  region: string;
  nearestMrt: string | null;
  capacityRange: Venue['capacityRange'];
  eventCount: number;
}

export interface RelatedTagStrip {
  slug: string;
  label: string;
  venues: RelatedVenueCard[];
}

export interface RelatedVenues {
  region: RelatedVenueCard[];
  tag: RelatedTagStrip | null;
}

interface BuildRelatedVenuesParams {
  venue: Pick<Venue, 'id' | 'region' | 'tags'>;
  allVenues: Venue[];
  dictionary: VenueTagDictionary | null;
  today: string;
}

export const buildRelatedVenues = (params: BuildRelatedVenuesParams): RelatedVenues => {
  void params;
  return { region: [], tag: null };
};
