import type { Venue, VenueTagDictionary } from '@/types';
import { getVisibleVenueTags } from './venueTags';

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

const MIN_OTHER_VENUES = 3;
const MAX_TAG_STRIP = 10;

const toCard = (v: Venue): RelatedVenueCard => ({
  id: v.id,
  name: v.name,
  coverPhoto: v.coverPhoto,
  region: v.region,
  nearestMrt: v.nearestMrt,
  capacityRange: v.capacityRange,
  eventCount: v.eventCount,
});

// Region strip: other venues in the same region, API order. Tag strip: first cardRank tag (by
// rank) that this venue shows and at least 3 other venues also show; same region first.
export const buildRelatedVenues = ({
  venue,
  allVenues,
  dictionary,
  today,
}: BuildRelatedVenuesParams): RelatedVenues => {
  const others = allVenues.filter((v) => v.id !== venue.id);
  const region = others.filter((v) => v.region === venue.region).map(toCard);
  if (!dictionary) return { region, tag: null };

  const ownSlugs = new Set(getVisibleVenueTags(venue.tags, dictionary, today).map((t) => t.slug));
  const candidates = dictionary.tags
    .filter((d) => d.cardRank !== undefined && ownSlugs.has(d.slug))
    .sort((a, b) => (a.cardRank ?? 0) - (b.cardRank ?? 0));
  if (candidates.length === 0) return { region, tag: null };

  const othersWithSlugs = others.map((v) => ({
    venue: v,
    slugs: new Set(getVisibleVenueTags(v.tags, dictionary, today).map((t) => t.slug)),
  }));

  for (const candidate of candidates) {
    const matches = othersWithSlugs.filter((o) => o.slugs.has(candidate.slug)).map((o) => o.venue);
    if (matches.length < MIN_OTHER_VENUES) continue;
    const sameRegion = matches.filter((v) => v.region === venue.region);
    const otherRegion = matches.filter((v) => v.region !== venue.region);
    return {
      region,
      tag: {
        slug: candidate.slug,
        label: candidate.label,
        venues: [...sameRegion, ...otherRegion].slice(0, MAX_TAG_STRIP).map(toCard),
      },
    };
  }
  return { region, tag: null };
};
