import type {
  CapacityRange,
  CreateVenueSubmissionData,
  VenueConditionAnswers,
  VenueConditionFees,
  VenueEquipmentOption,
  VenueServiceOption,
  VenueSpaceOption,
  VenueUseOption,
} from '@/types';
import { getHttpUrlError } from '@/utils';
import {
  createTransitRow,
  getTransitRowErrors,
  isBlankTransitRow,
  toTransitStops,
  type TransitRowValue,
} from '@/utils/transitStops';

// State, validation and payload of the 3-step store form (venue-tags design-frontend §D)

export type SubmitStep = 1 | 2 | 3;
export const STEP_COUNT = 3;

export const STEP_META: Record<SubmitStep, { name: string; heading: string }> = {
  1: { name: '場地基本資料', heading: '輸入你的場地名稱或地點' },
  2: { name: '活動與空間', heading: '主辦可以在這個空間做什麼？' },
  3: { name: '聯絡方式、照片與其他', heading: '主辦怎麼聯絡你們？' },
};

export interface SelectedPlace {
  placeId: string;
  label: string; // Google name, shown on the selected card
  address: string;
  lat: number;
  lng: number;
}

export interface LinkRowValue {
  id: string;
  value: string;
}

// url null = still uploading; never persisted or sent
export interface PhotoSlot {
  id: string;
  url: string | null;
}

export type SubmitContact = 'instagram' | 'threads' | 'line';

export interface FeeAnswers {
  venueFee: 'free' | 'paid' | 'depends' | '';
  freeVenueLimited: boolean;
  freeVenueUntil: string; // kept while unchecked so re-checking restores it
  guarantee: 'yes' | 'no' | '';
  deposit: 'yes' | 'no' | '';
  discussable: boolean;
}

export interface VenueSubmitFormValues {
  place: SelectedPlace | null;
  name: string; // kept after "重新搜尋" even though the field is hidden
  region: string;
  transitStops: TransitRowValue[];
  capacityRange: CapacityRange | '';
  uses: { options: VenueUseOption[]; discussable: boolean };
  fees: FeeAnswers; // kept while 佈置 is unchecked; only sent when it is checked
  services: { options: VenueServiceOption[]; discussable: boolean };
  spaceTypes: VenueSpaceOption[];
  equipment: VenueEquipmentOption[];
  note: string;
  preferredContact: SubmitContact | '';
  instagram: string;
  threads: string;
  contactUrl: string;
  bookingFormUrl: string;
  sourceLinks: LinkRowValue[];
  calendarUrl: string;
  // One list; the first finished photo becomes the cover (venue-tags §D step 3)
  photos: PhotoSlot[];
  description: string;
}

export const USE_OPTIONS: { value: VenueUseOption; label: string; description: string }[] = [
  { value: 'goods_distribution', label: '發放應援物', description: '可以協助主辦代發應援物' },
  {
    value: 'can_decorate',
    label: '佈置、辦生咖',
    description: '主辦可以在店裡佈置，辦生咖、展覽或生日應援等',
  },
  { value: 'private_booking', label: '包場', description: '整間店只給這場活動用' },
];

export const SERVICE_OPTIONS: { value: VenueServiceOption; label: string }[] = [
  { value: 'parcel_receiving', label: '代收應援物' },
  { value: 'early_setup', label: '可提前佈展' },
  { value: 'custom_menu', label: '客製餐點' },
  { value: 'beginner_friendly', label: '歡迎新手主辦' },
];

export const SPACE_OPTIONS: { value: VenueSpaceOption; label: string }[] = [
  { value: 'cafe', label: '咖啡廳' },
  { value: 'exhibition_space', label: '展覽空間' },
  { value: 'bar', label: '酒吧、餐酒館' },
  { value: 'multi_space', label: '多功能空間' },
  { value: 'takeaway_shop', label: '以外帶為主' },
];

export const EQUIPMENT_OPTIONS: { value: VenueEquipmentOption; label: string }[] = [
  { value: 'projector', label: '投影或螢幕' },
  { value: 'sound_system', label: '可播放音樂' },
  { value: 'display_fixtures', label: '佈置設備' },
];

export const NOTE_MAX_LENGTH = 1000;
export const MAX_SOURCE_LINKS = 5;
export const MAX_PHOTOS = 10;
export const PHOTOS_REQUIRED_ERROR = '請至少上傳一張照片';

export const OPTION_OR_UNSURE_ERROR = '請至少選一項，或勾「還沒確定」。';
export const FEES_REQUIRED_ERROR = '請至少回答一題，或勾「要看檔期和方案」。';
export const SPACE_REQUIRED_ERROR = '請至少選一項。';
export const UNTIL_EXPIRED_ERROR = '請重新選擇日期';

const CHANNEL_REQUIREMENT: Record<
  SubmitContact,
  { field: 'instagram' | 'threads' | 'contactUrl'; message: string }
> = {
  instagram: { field: 'instagram', message: '請填寫 Instagram 帳號' },
  threads: { field: 'threads', message: '請填寫 Threads 帳號' },
  line: { field: 'contactUrl', message: '請填寫 LINE 連結' },
};

let nextRowId = 0;
export const createLinkRow = (value = ''): LinkRowValue => ({
  id: `source-link-${nextRowId++}`,
  value,
});
export const createPhotoSlot = (url: string | null = null): PhotoSlot => ({
  id: `photo-${nextRowId++}`,
  url,
});

export const EMPTY_FEES: FeeAnswers = {
  venueFee: '',
  freeVenueLimited: false,
  freeVenueUntil: '',
  guarantee: '',
  deposit: '',
  discussable: false,
};

export function createEmptyForm(): VenueSubmitFormValues {
  return {
    place: null,
    name: '',
    region: '',
    transitStops: [createTransitRow()],
    capacityRange: '',
    uses: { options: [], discussable: false },
    fees: { ...EMPTY_FEES },
    services: { options: [], discussable: false },
    spaceTypes: [],
    equipment: [],
    note: '',
    preferredContact: '',
    instagram: '',
    threads: '',
    contactUrl: '',
    bookingFormUrl: '',
    sourceLinks: [createLinkRow()],
    calendarUrl: '',
    photos: [],
    description: '',
  };
}

// Error keys: field names, plus `transit.<rowId>.type|station` and `sourceLink.<rowId>`
export type FormErrors = Record<string, string>;

export const transitErrorKey = (rowId: string, part: 'type' | 'station') =>
  `transit.${rowId}.${part}`;
export const sourceLinkErrorKey = (rowId: string) => `sourceLink.${rowId}`;

const isDecorating = (form: VenueSubmitFormValues) => form.uses.options.includes('can_decorate');
const hasFreeVenueLimit = (fees: FeeAnswers) => fees.venueFee === 'free' && fees.freeVenueLimited;

function validateStep1(form: VenueSubmitFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!form.place) errors.place = '請從搜尋結果選擇你的店家';
  // The name field only exists once a place is picked
  else if (!form.name.trim()) errors.name = '請填寫場地名稱';
  if (!form.region) errors.region = '請選擇地區';
  for (const [rowId, rowErrors] of Object.entries(getTransitRowErrors(form.transitStops))) {
    if (rowErrors.type) errors[transitErrorKey(rowId, 'type')] = rowErrors.type;
    if (rowErrors.station) errors[transitErrorKey(rowId, 'station')] = rowErrors.station;
  }
  if (!form.capacityRange) errors.capacityRange = '請選擇容納人數';
  return errors;
}

function validateStep2(form: VenueSubmitFormValues, today: string): FormErrors {
  const errors: FormErrors = {};
  if (form.uses.options.length === 0 && !form.uses.discussable) {
    errors.uses = OPTION_OR_UNSURE_ERROR;
  }
  if (isDecorating(form)) {
    const { fees } = form;
    if (!fees.venueFee && !fees.guarantee && !fees.deposit && !fees.discussable) {
      errors.fees = FEES_REQUIRED_ERROR;
    }
    // The backend rejects past dates; a restored draft may cross midnight
    if (hasFreeVenueLimit(fees) && fees.freeVenueUntil && fees.freeVenueUntil < today) {
      errors.freeVenueUntil = UNTIL_EXPIRED_ERROR;
    }
  }
  if (form.services.options.length === 0 && !form.services.discussable) {
    errors.services = OPTION_OR_UNSURE_ERROR;
  }
  if (form.spaceTypes.length === 0) errors.spaceTypes = SPACE_REQUIRED_ERROR;
  return errors;
}

function validateStep3(form: VenueSubmitFormValues): FormErrors {
  const errors: FormErrors = {};
  const contact = form.preferredContact;
  if (!contact) {
    errors.preferredContact = '請選擇偏好的聯絡方式';
  } else {
    // The LINE link is hidden for other channels, so it is neither validated nor sent
    if (contact === 'line') {
      const urlError = getHttpUrlError(form.contactUrl.trim());
      if (urlError) errors.contactUrl = urlError;
    }
    const { field, message } = CHANNEL_REQUIREMENT[contact];
    if (!form[field].trim() && !errors[field]) errors[field] = message;
    if (contact === 'line' && !form.instagram.trim() && !form.threads.trim()) {
      errors.socialMedia = '請填寫至少一個社群帳號';
    }
  }
  const bookingError = getHttpUrlError(form.bookingFormUrl.trim());
  if (bookingError) errors.bookingFormUrl = bookingError;
  for (const row of form.sourceLinks) {
    const linkError = getHttpUrlError(row.value.trim());
    if (linkError) errors[sourceLinkErrorKey(row.id)] = linkError;
  }
  const calendarError = getHttpUrlError(form.calendarUrl.trim());
  if (calendarError) errors.calendarUrl = calendarError;
  if (!form.photos.some((slot) => slot.url)) errors.photos = PHOTOS_REQUIRED_ERROR;
  return errors;
}

export function validateStep(
  step: SubmitStep,
  form: VenueSubmitFormValues,
  today: string
): FormErrors {
  if (step === 1) return validateStep1(form);
  if (step === 2) return validateStep2(form, today);
  return validateStep3(form);
}

// Submit re-checks every step: earlier steps may have been broken via "上一步" + forward
export function validateAllSteps(
  form: VenueSubmitFormValues,
  today: string
): { firstStep: SubmitStep | null; errors: FormErrors } {
  let firstStep: SubmitStep | null = null;
  let errors: FormErrors = {};
  for (const step of [1, 2, 3] as const) {
    const stepErrors = validateStep(step, form, today);
    if (Object.keys(stepErrors).length > 0 && firstStep === null) firstStep = step;
    errors = { ...errors, ...stepErrors };
  }
  return { firstStep, errors };
}

const trimmedOrUndefined = (value: string) => value.trim() || undefined;

function buildFees(fees: FeeAnswers): VenueConditionFees {
  const out: VenueConditionFees = {};
  if (fees.venueFee) out.venueFee = fees.venueFee;
  // Any date means "limited" to the backend, so an unchecked limit must not carry one
  if (hasFreeVenueLimit(fees)) {
    out.freeVenueLimited = true;
    if (fees.freeVenueUntil) out.freeVenueUntil = fees.freeVenueUntil;
  }
  if (fees.guarantee) out.guarantee = fees.guarantee;
  if (fees.deposit) out.deposit = fees.deposit;
  if (fees.discussable) out.discussable = true;
  return out;
}

const inOrder = <T extends string>(selected: T[], options: { value: T }[]): T[] =>
  options.map((o) => o.value).filter((value) => selected.includes(value));

// Assumes validateAllSteps passed (place, contact and cover are present)
export function buildSubmissionPayload(form: VenueSubmitFormValues): CreateVenueSubmissionData {
  const place = form.place as SelectedPlace;
  const venueConditions: VenueConditionAnswers = {
    uses: { options: inOrder(form.uses.options, USE_OPTIONS) },
    services: { options: inOrder(form.services.options, SERVICE_OPTIONS) },
    spaceTypes: { options: inOrder(form.spaceTypes, SPACE_OPTIONS) },
  };
  if (form.uses.discussable) venueConditions.uses.discussable = true;
  if (form.services.discussable) venueConditions.services.discussable = true;
  if (isDecorating(form)) venueConditions.fees = buildFees(form.fees);
  if (form.equipment.length > 0) {
    venueConditions.equipment = inOrder(form.equipment, EQUIPMENT_OPTIONS);
  }
  const note = trimmedOrUndefined(form.note);
  if (note) venueConditions.note = note;
  const sourceLinks = form.sourceLinks.map((row) => row.value.trim()).filter(Boolean);
  if (sourceLinks.length > 0) venueConditions.sourceLinks = sourceLinks;
  const calendarUrl = trimmedOrUndefined(form.calendarUrl);
  if (calendarUrl) venueConditions.calendarUrl = calendarUrl;

  const instagram = trimmedOrUndefined(form.instagram);
  const threads = trimmedOrUndefined(form.threads);
  const [coverPhoto, ...otherPhotos] = form.photos.flatMap((slot) => (slot.url ? [slot.url] : []));

  const payload: CreateVenueSubmissionData = {
    name: form.name.trim(),
    address: place.address,
    region: form.region,
    capacityRange: form.capacityRange as CapacityRange,
    placeId: place.placeId,
    lat: place.lat,
    lng: place.lng,
    transitStops: toTransitStops(form.transitStops),
    coverPhoto: coverPhoto ?? '', // validation guarantees one
    preferredContact: form.preferredContact as SubmitContact,
    venueConditions,
  };
  const description = trimmedOrUndefined(form.description);
  if (description) payload.description = description;
  if (otherPhotos.length > 0) payload.otherPhotos = otherPhotos;
  if (instagram || threads) {
    payload.socialMedia = {
      ...(instagram && { instagram }),
      ...(threads && { threads }),
    };
  }
  if (form.preferredContact === 'line') payload.contactUrl = form.contactUrl.trim();
  const bookingFormUrl = trimmedOrUndefined(form.bookingFormUrl);
  if (bookingFormUrl) payload.bookingFormUrl = bookingFormUrl;
  return payload;
}

// Row ids differ per instance and blank rows mean nothing, so compare the meaningful parts
function comparable(form: VenueSubmitFormValues) {
  return JSON.stringify({
    ...form,
    transitStops: form.transitStops
      .filter((row) => !isBlankTransitRow(row))
      .map(({ type, station, walkMinutes }) => [type, station, walkMinutes]),
    sourceLinks: form.sourceLinks.map((row) => row.value).filter((value) => value.trim()),
    photos: form.photos.length,
  });
}

const EMPTY_COMPARABLE = comparable(createEmptyForm());

export const hasAnyInput = (form: VenueSubmitFormValues): boolean =>
  comparable(form) !== EMPTY_COMPARABLE;
