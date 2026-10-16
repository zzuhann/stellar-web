import type { VenueTag, VenueTagDictionary, VenueTagGroupKey } from '@/types';

// Date helpers are string-only: new Date('YYYY-MM-DD') parses as UTC and shifts a day elsewhere.
const parseYmd = (ymd: string) => {
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
};

// '2026-01-05' → '2026/1/5'
export const formatTagDate = (ymd: string): string => {
  const { year, month, day } = parseYmd(ymd);
  return `${year}/${month}/${day}`;
};

// Drops the year when it matches today's Taipei year: '2026-12-31' → '12/31'
export const formatConditionUntil = (ymd: string, today: string): string => {
  const { year, month, day } = parseYmd(ymd);
  return year === parseYmd(today).year ? `${month}/${day}` : `${year}/${month}/${day}`;
};

export const formatCardTagLabel = (tag: VenueTag, label: string, today: string): string => {
  if (tag.until) return `${label}・限期至 ${formatConditionUntil(tag.until, today)}`;
  if (tag.limited) return `${label}（限期）`;
  return label;
};

// until is inclusive; YYYY-MM-DD strings compare correctly as plain strings
export const isVenueTagActiveOn = (tag: VenueTag, today: string): boolean =>
  !tag.until || tag.until >= today;

declare const visibleVenueTagBrand: unique symbol;

// Only getVisibleVenueTags produces this, so builders cannot be fed raw venue.tags
export type VisibleVenueTag = VenueTag & { readonly [visibleVenueTagBrand]: true };

export const getVisibleVenueTags = (
  tags: VenueTag[] | undefined,
  dictionary: VenueTagDictionary | null,
  today: string
): VisibleVenueTag[] => {
  if (!dictionary || !tags) return [];
  const known = new Set(dictionary.tags.map((d) => d.slug));
  return tags.filter(
    (tag) => known.has(tag.slug) && isVenueTagActiveOn(tag, today)
  ) as VisibleVenueTag[];
};

// Card shows at most 3 tags by cardRank; tags without cardRank never reach the card
export const pickCardTags = (
  tags: readonly VisibleVenueTag[],
  dictionary: VenueTagDictionary
): VisibleVenueTag[] => {
  const rankBySlug = new Map<string, number>();
  for (const d of dictionary.tags) if (d.cardRank !== undefined) rankBySlug.set(d.slug, d.cardRank);
  const rank = (tag: VisibleVenueTag) => rankBySlug.get(tag.slug) ?? Infinity;
  return tags
    .filter((tag) => rankBySlug.has(tag.slug))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 3);
};

const indexBySlug = (tags: readonly VisibleVenueTag[]) =>
  new Map(tags.map((tag) => [tag.slug, tag]));

export const NO_DECORATE_CONDITION_TEXT = '佈置條件可詢問店家';

// today only decides whether the date shows its year; expiry is already filtered
export const buildVenueConditionText = (
  tags: readonly VisibleVenueTag[],
  today: string
): string | null => {
  const bySlug = indexBySlug(tags);
  const free = bySlug.get('free_venue');
  const parts: string[] = [];

  if (free && bySlug.has('venue_fee')) {
    const freeText = free.until
      ? `免場地費（至 ${formatConditionUntil(free.until, today)}）`
      : free.limited
        ? '限期免場地費'
        : '免場地費';
    parts.push(`依方案${freeText}或需場地費`);
  } else if (free) {
    parts.push(
      free.until
        ? `${formatTagDate(free.until)} 前免場地費`
        : free.limited
          ? '限期免場地費'
          : '免場地費'
    );
  } else if (bySlug.has('venue_fee')) {
    parts.push('需場地費');
  }

  const rest: [string, string][] = [
    ['needs_guarantee', '需達保底'],
    ['deposit', '需押金（活動後退還）'],
    ['no_min_guarantee', '沒有杯數門檻'],
    ['early_setup', '可提前佈展'],
    ['display_fixtures', '有佈置設備'],
  ];
  for (const [slug, text] of rest) if (bySlug.has(slug)) parts.push(text);

  return parts.length > 0 ? parts.join('・') : null;
};

export type VenueUsageRowKey = 'distribution' | 'decorate' | 'privateBooking';

export interface VenueUsageRow {
  key: VenueUsageRowKey;
  title: string;
  description: string | null;
}

export const buildVenueUsageRows = (
  tags: readonly VisibleVenueTag[],
  today: string
): VenueUsageRow[] => {
  const bySlug = indexBySlug(tags);
  const rows: VenueUsageRow[] = [];

  if (bySlug.has('goods_distribution')) {
    rows.push({
      key: 'distribution',
      title: '發放應援物',
      description: bySlug.has('parcel_receiving')
        ? '店家可以代發，也可以代收應援物'
        : '店家可以代發',
    });
  }
  if (bySlug.has('can_decorate')) {
    const condition = buildVenueConditionText(tags, today);
    rows.push({
      key: 'decorate',
      title: '佈置、辦生咖',
      description: condition ?? NO_DECORATE_CONDITION_TEXT,
    });
  }
  if (bySlug.has('private_booking')) {
    rows.push({ key: 'privateBooking', title: '包場', description: null });
  }
  return rows;
};

export interface VenueFacilityRow {
  key: VenueTagGroupKey;
  label: string;
  tags: { slug: string; label: string }[];
}

const FACILITY_GROUPS: VenueTagGroupKey[] = ['service', 'transport', 'space', 'equipment'];
// Already shown as usage rows (or only drive them), so they stay out of this section
const USAGE_ONLY_SLUGS = new Set(['goods_distribution', 'private_booking', 'can_decorate']);

export const buildVenueFacilityRows = (
  tags: readonly VisibleVenueTag[],
  dictionary: VenueTagDictionary
): VenueFacilityRow[] => {
  const owned = new Set(tags.map((tag) => tag.slug));
  const hideParcel = owned.has('goods_distribution');

  return FACILITY_GROUPS.map((key) => ({
    key,
    label: dictionary.groups.find((g) => g.key === key)?.label ?? key,
    tags: dictionary.tags
      .filter((d) => d.group === key && owned.has(d.slug))
      .filter((d) => !USAGE_ONLY_SLUGS.has(d.slug))
      .filter((d) => !(hideParcel && d.slug === 'parcel_receiving'))
      .sort((a, b) => a.order - b.order)
      .map((d) => ({ slug: d.slug, label: d.label })),
  })).filter((row) => row.tags.length > 0);
};
