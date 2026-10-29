import type {
  FirebaseTimestamp,
  VenueConditionAnswers,
  VenueDetail,
  VenueSubmissionRecord,
  VenueSuggestedTag,
  VenueTagDictionary,
} from '@/types';
import { dateToTaipeiDateString } from '@/utils';
import { formatTagDate } from '@/utils/venueTags';
import type { TagEntry, TagFieldsSource } from './adminVenueTagFields';

// Store-suggestion helpers for the admin edit page (venue-tags design-frontend §E, design-backend §3.4)

export type SourceMarker = '店家建議' | '自動帶入' | '管理員新增' | '店家建議・未採用';

export const isSubmissionPending = (submission: VenueSubmissionRecord | undefined): boolean =>
  !!submission && submission.confirmedAt == null;

const toDate = (value: FirebaseTimestamp | string): Date =>
  typeof value === 'string' ? new Date(value) : new Date(value._seconds * 1000);

export const submittedOnTaipei = (submittedAt: FirebaseTimestamp | string): string =>
  dateToTaipeiDateString(toDate(submittedAt));

const stripSource = ({ slug, limited, until }: VenueSuggestedTag) => ({
  slug,
  ...(limited && { limited }),
  ...(until && { until }),
});

// Pending suggestions prefill the tag area; confirmed or admin-created venues use the saved fields
export function buildInitialTagFields(venue: VenueDetail): TagFieldsSource {
  const saved: TagFieldsSource = {
    tags: venue.tags ?? [],
    sourceLinks: venue.sourceLinks ?? [],
    equipmentNote: venue.equipmentNote ?? '',
    infoUpdatedOn: venue.infoUpdatedOn ?? null,
    calendarUrl: venue.calendarUrl ?? null,
  };
  const { submission } = venue;
  if (!submission || !isSubmissionPending(submission)) return saved;
  return {
    ...saved,
    tags: submission.suggestedTags.map(stripSource),
    sourceLinks: submission.answers.sourceLinks ?? [],
    // First confirmation defaults to the Taipei submission date, not today
    infoUpdatedOn: saved.infoUpdatedOn ?? submittedOnTaipei(submission.submittedAt),
  };
}

export function getSourceMarker(
  slug: string,
  checked: boolean,
  suggested: VenueSuggestedTag[]
): SourceMarker | null {
  const suggestion = suggested.find((tag) => tag.slug === slug);
  if (suggestion) {
    if (!checked) return '店家建議・未採用';
    return suggestion.source === 'auto' ? '自動帶入' : '店家建議';
  }
  return checked ? '管理員新增' : null;
}

export function buildSuggestionSummary(
  entries: Record<string, TagEntry>,
  suggested: VenueSuggestedTag[],
  dictionary: VenueTagDictionary
): string | null {
  const groups: Record<'自動帶入' | '管理員新增' | '店家建議・未採用', string[]> = {
    自動帶入: [],
    管理員新增: [],
    '店家建議・未採用': [],
  };
  for (const def of dictionary.tags) {
    const marker = getSourceMarker(def.slug, !!entries[def.slug]?.checked, suggested);
    if (marker && marker !== '店家建議') groups[marker].push(def.label);
  }
  const parts = [
    groups.自動帶入.length > 0 && `自動帶入 ${groups.自動帶入.join('、')}`,
    groups.管理員新增.length > 0 && `新增 ${groups.管理員新增.join('、')}`,
    groups['店家建議・未採用'].length > 0 && `未採用 ${groups['店家建議・未採用'].join('、')}`,
  ].filter(Boolean);
  return parts.length > 0 ? `跟店家建議相比：${parts.join('；')}` : null;
}

export const SUPPLEMENT_FOOTER = '這段不會變成標籤。設備的部分請複製到「店家提供的設備」。';
const UNSURE = '還沒確定，想先跟主辦聊聊';
const FEES_UNSURE = '要看檔期和方案，想先跟主辦聊聊';

export interface SubmissionSupplement {
  note: string | null;
  remarks: string[];
  footer: string;
}

export function buildSubmissionSupplement(
  answers: VenueConditionAnswers
): SubmissionSupplement | null {
  const remarks: string[] = [];
  if (answers.uses.discussable) remarks.push(`用途：店家勾了「${UNSURE}」`);
  if (answers.fees?.discussable) remarks.push(`費用：店家勾了「${FEES_UNSURE}」`);
  if (answers.services.discussable) remarks.push(`服務：店家勾了「${UNSURE}」`);
  const note = answers.note?.trim() ? answers.note : null;
  if (!note && remarks.length === 0) return null;
  return { note, remarks, footer: SUPPLEMENT_FOOTER };
}

const VENUE_FEE_LABEL = { free: '不用場地費', paid: '要場地費', depends: '看方案' } as const;
const YES_NO_GUARANTEE = { yes: '有', no: '沒有' } as const;
const YES_NO_DEPOSIT = { yes: '要', no: '不用' } as const;
const NO_ANSWER = '沒答';

export function buildFeeAnswerLines(answers: VenueConditionAnswers): string[] {
  if (!answers.uses.options.includes('can_decorate')) {
    return ['沒有選佈置、辦生咖，不用答費用'];
  }
  const fees = answers.fees ?? {};
  let venueFee: string = fees.venueFee ? VENUE_FEE_LABEL[fees.venueFee] : NO_ANSWER;
  if (fees.venueFee === 'free' && fees.freeVenueUntil) {
    venueFee += `（限時優惠到 ${formatTagDate(fees.freeVenueUntil)}）`;
  } else if (fees.venueFee === 'free' && fees.freeVenueLimited) {
    venueFee += '（限時優惠，沒有填日期）';
  }
  return [
    `場地費：${venueFee}`,
    `保底：${fees.guarantee ? YES_NO_GUARANTEE[fees.guarantee] : NO_ANSWER}`,
    `押金：${fees.deposit ? YES_NO_DEPOSIT[fees.deposit] : NO_ANSWER}`,
  ];
}
