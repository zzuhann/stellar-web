import { z } from 'zod';
import { createTransitRow } from '@/utils/transitStops';
import {
  createLinkRow,
  createPhotoSlot,
  type SubmitStep,
  type VenueSubmitFormValues,
} from './venueSubmitModel';

// Per-tab draft in sessionStorage (venue-tags design-frontend §D「分頁內暫存」)

export const DRAFT_KEY = 'stellar:venue-submit-draft';
// Bump whenever the stored shape changes; 1 was the 4-step layout
export const DRAFT_VERSION = 2;

export interface VenueSubmitDraft {
  version: number;
  form: VenueSubmitFormValues;
  maxStep: SubmitStep;
  depth: number; // history depth of the entry the user is on (see stepHistory)
}

const step = z.union([z.literal(1), z.literal(2), z.literal(3)]);
const str = z.string();
const bool = z.boolean();

const storedFormSchema = z.object({
  place: z
    .object({ placeId: str, label: str, address: str, lat: z.number(), lng: z.number() })
    .nullable(),
  name: str,
  region: str,
  transitStops: z.array(
    z.object({
      type: z.enum(['', 'mrt', 'light_rail', 'train', 'hsr', 'bus']),
      station: str,
      walkMinutes: z.string().regex(/^\d{0,3}$/),
    })
  ),
  capacityRange: z.enum(['', '20以下', '20-40', '40-60', '60以上']),
  uses: z.object({
    options: z.array(z.enum(['goods_distribution', 'can_decorate', 'private_booking'])),
    discussable: bool,
  }),
  fees: z.object({
    venueFee: z.enum(['', 'free', 'paid', 'depends']),
    freeVenueLimited: bool,
    freeVenueUntil: str,
    guarantee: z.enum(['', 'yes', 'no']),
    deposit: z.enum(['', 'yes', 'no']),
    discussable: bool,
  }),
  services: z.object({
    options: z.array(
      z.enum(['parcel_receiving', 'early_setup', 'custom_menu', 'beginner_friendly'])
    ),
    discussable: bool,
  }),
  spaceTypes: z.array(z.enum(['cafe', 'exhibition_space', 'bar', 'multi_space', 'takeaway_shop'])),
  equipment: z.array(z.enum(['projector', 'sound_system', 'display_fixtures'])),
  note: str,
  preferredContact: z.enum(['', 'instagram', 'threads', 'line']),
  instagram: str,
  threads: str,
  contactUrl: str,
  bookingFormUrl: str,
  sourceLinks: z.array(str),
  calendarUrl: str,
  coverPhoto: str,
  // Only finished uploads; blob previews and in-flight slots are never stored
  otherPhotos: z.array(z.string().regex(/^https?:\/\//)),
  description: str,
});

const draftSchema = z.object({
  version: z.literal(DRAFT_VERSION),
  form: storedFormSchema,
  maxStep: step,
  depth: z.number().int().min(0),
});

type StoredForm = z.infer<typeof storedFormSchema>;

function toStoredForm(form: VenueSubmitFormValues): StoredForm {
  return {
    ...form,
    transitStops: form.transitStops.map(({ type, station, walkMinutes }) => ({
      type,
      station,
      walkMinutes,
    })),
    sourceLinks: form.sourceLinks.map((row) => row.value),
    otherPhotos: form.otherPhotos.flatMap((slot) => (slot.url ? [slot.url] : [])),
  };
}

function fromStoredForm(stored: StoredForm): VenueSubmitFormValues {
  return {
    ...stored,
    transitStops: stored.transitStops.length
      ? stored.transitStops.map((row) => createTransitRow(row))
      : [createTransitRow()],
    sourceLinks: stored.sourceLinks.length
      ? stored.sourceLinks.map((value) => createLinkRow(value))
      : [createLinkRow()],
    otherPhotos: stored.otherPhotos.map((url) => createPhotoSlot(url)),
  };
}

export const serializeDraft = (draft: VenueSubmitDraft): string =>
  JSON.stringify({ ...draft, form: toStoredForm(draft.form) });

// Wrong version, broken JSON or wrong shape all mean "no draft"
export function parseDraft(raw: string | null): VenueSubmitDraft | null {
  if (!raw) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = draftSchema.safeParse(json);
  if (!result.success) return null;
  return { ...result.data, form: fromStoredForm(result.data.form) };
}

export function parseStepParam(search: string): SubmitStep {
  const value = new URLSearchParams(search).get('step');
  if (value === '2') return 2;
  if (value === '3') return 3;
  return 1;
}

export function resolveInitialStep(
  urlStep: SubmitStep,
  draft: VenueSubmitDraft | null
): SubmitStep {
  if (!draft) return 1;
  return Math.min(urlStep, draft.maxStep) as SubmitStep;
}

// Reading window.sessionStorage itself can throw (blocked storage), not only its methods
function getStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readDraft(): VenueSubmitDraft | null {
  try {
    return parseDraft(getStorage()?.getItem(DRAFT_KEY) ?? null);
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    getStorage()?.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable: nothing to clear
  }
}

// A failed write drops the older draft, so a reload never restores stale content
export function writeDraft(draft: VenueSubmitDraft): void {
  try {
    getStorage()?.setItem(DRAFT_KEY, serializeDraft(draft));
  } catch {
    clearDraft();
  }
}
