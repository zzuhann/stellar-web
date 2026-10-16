import type { CreateVenueData, UpdateVenueData, VenueTag, VenueTagDictionary } from '@/types';
import { getHttpUrlError } from '@/utils';
import {
  buildVenueUsageRows,
  formatCardTagLabel,
  getVisibleVenueTags,
  pickCardTags,
  type VenueUsageRow,
} from '@/utils/venueTags';

// Pure helpers behind the admin tag section (venue-tags §E, design-backend §7.4)

export type TagLimitMode = 'none' | 'limited' | 'until';

export interface TagEntry {
  checked: boolean;
  mode: TagLimitMode;
  until: string; // kept when unchecking or switching mode, so re-checking restores it
}

export interface TagFormState {
  entries: Record<string, TagEntry>;
  sourceLinks: string[]; // raw rows, may contain blanks
  equipmentNote: string;
  infoUpdatedOn: string; // '' means empty
  calendarUrl: string;
}

// Saved values as the admin detail returns them
export interface TagFieldsSource {
  tags: VenueTag[];
  sourceLinks: string[];
  equipmentNote: string;
  infoUpdatedOn: string | null;
  calendarUrl: string | null;
}

export const MAX_SOURCE_LINKS = 5;
export const EQUIPMENT_NOTE_MAX = 1000;

export const EMPTY_TAG_FIELDS: TagFieldsSource = {
  tags: [],
  sourceLinks: [],
  equipmentNote: '',
  infoUpdatedOn: null,
  calendarUrl: null,
};

export function toTagFormState(source: TagFieldsSource): TagFormState {
  const entries: Record<string, TagEntry> = {};
  for (const tag of source.tags) {
    entries[tag.slug] = {
      checked: true,
      mode: tag.until ? 'until' : tag.limited ? 'limited' : 'none',
      until: tag.until ?? '',
    };
  }
  return {
    entries,
    sourceLinks: source.sourceLinks.length > 0 ? [...source.sourceLinks] : [''],
    equipmentNote: source.equipmentNote,
    infoUpdatedOn: source.infoUpdatedOn ?? '',
    calendarUrl: source.calendarUrl ?? '',
  };
}

// Unknown slugs (e.g. later deactivated) are dropped: the backend rejects them with 400
export function entriesToTags(
  entries: Record<string, TagEntry>,
  dictionary: VenueTagDictionary
): VenueTag[] {
  return dictionary.tags.flatMap((def): VenueTag[] => {
    const entry = entries[def.slug];
    if (!entry?.checked) return [];
    if (entry.mode === 'until') return [{ slug: def.slug, limited: true, until: entry.until }];
    if (entry.mode === 'limited') return [{ slug: def.slug, limited: true }];
    return [{ slug: def.slug }];
  });
}

const tagKey = (tag: VenueTag) => `${tag.slug}|${tag.limited ? 1 : 0}|${tag.until ?? ''}`;

// Order-insensitive; limited/until differences count as a change. Sorted keys, not a Set,
// so [a, b] and [a, a] stay different
const sortedTagKeys = (tags: VenueTag[]) => tags.map(tagKey).sort().join('\n');

export const sameTags = (a: VenueTag[], b: VenueTag[]): boolean =>
  sortedTagKeys(a) === sortedTagKeys(b);

const normalizeLinks = (links: string[]) => links.map((l) => l.trim()).filter(Boolean);

interface NormalizedTagFields {
  tags: VenueTag[];
  sourceLinks: string[];
  equipmentNote: string;
  infoUpdatedOn: string | null;
  calendarUrl: string | null;
}

function normalize(state: TagFormState, dictionary: VenueTagDictionary): NormalizedTagFields {
  return {
    tags: entriesToTags(state.entries, dictionary),
    sourceLinks: normalizeLinks(state.sourceLinks),
    equipmentNote: state.equipmentNote.trim(),
    infoUpdatedOn: state.infoUpdatedOn || null,
    calendarUrl: state.calendarUrl.trim() || null,
  };
}

// PATCH: only fields that differ from load time; deliberate clears ([] / '' / null) are sent
export function buildTagFieldsPatch(
  initial: TagFormState,
  current: TagFormState,
  dictionary: VenueTagDictionary
): Partial<UpdateVenueData> {
  const before = normalize(initial, dictionary);
  const after = normalize(current, dictionary);
  const patch: Partial<UpdateVenueData> = {};

  if (!sameTags(before.tags, after.tags)) patch.tags = after.tags;
  if (before.sourceLinks.join('\n') !== after.sourceLinks.join('\n')) {
    patch.sourceLinks = after.sourceLinks;
  }
  if (before.equipmentNote !== after.equipmentNote) patch.equipmentNote = after.equipmentNote;
  if (before.infoUpdatedOn !== after.infoUpdatedOn) patch.infoUpdatedOn = after.infoUpdatedOn;
  if (before.calendarUrl !== after.calendarUrl) patch.calendarUrl = after.calendarUrl;
  return patch;
}

// POST: tags and infoUpdatedOn always; the rest only when filled
export function buildTagFieldsCreate(
  current: TagFormState,
  dictionary: VenueTagDictionary
): Partial<CreateVenueData> {
  const fields = normalize(current, dictionary);
  const data: Partial<CreateVenueData> = {
    tags: fields.tags,
    infoUpdatedOn: fields.infoUpdatedOn,
  };
  if (fields.sourceLinks.length > 0) data.sourceLinks = fields.sourceLinks;
  if (fields.equipmentNote) data.equipmentNote = fields.equipmentNote;
  if (fields.calendarUrl) data.calendarUrl = fields.calendarUrl;
  return data;
}

export const MISSING_UNTIL_ERROR = '請選擇日期，或改成「限期（目前沒有設定結束日）」';

export interface TagFieldErrors {
  sourceLinks: Record<number, string>;
  until: Record<string, string>;
  calendarUrl?: string;
}

export function getTagFieldErrors(
  state: TagFormState,
  dictionary: VenueTagDictionary
): TagFieldErrors {
  const errors: TagFieldErrors = { sourceLinks: {}, until: {} };
  state.sourceLinks.forEach((link, i) => {
    const error = getHttpUrlError(link.trim());
    if (error) errors.sourceLinks[i] = error;
  });
  for (const def of dictionary.tags) {
    const entry = state.entries[def.slug];
    if (entry?.checked && entry.mode === 'until' && !entry.until) {
      errors.until[def.slug] = MISSING_UNTIL_ERROR;
    }
  }
  const calendarError = getHttpUrlError(state.calendarUrl.trim());
  if (calendarError) errors.calendarUrl = calendarError;
  return errors;
}

export const hasTagFieldErrors = (errors: TagFieldErrors) =>
  Object.keys(errors.sourceLinks).length > 0 ||
  Object.keys(errors.until).length > 0 ||
  Boolean(errors.calendarUrl);

export interface AdminVenuePreview {
  cardTagLabels: string[];
  usageRows: VenueUsageRow[];
}

// Same pipeline as the public pages: expiry filter first, then the shared builders
export function buildAdminVenuePreview(
  tags: VenueTag[],
  dictionary: VenueTagDictionary,
  today: string
): AdminVenuePreview {
  const visible = getVisibleVenueTags(tags, dictionary, today);
  const labelBySlug = new Map(dictionary.tags.map((d) => [d.slug, d.label]));
  return {
    cardTagLabels: pickCardTags(visible, dictionary).map((tag) =>
      formatCardTagLabel(tag, labelBySlug.get(tag.slug) ?? tag.slug, today)
    ),
    usageRows: buildVenueUsageRows(visible, today),
  };
}
