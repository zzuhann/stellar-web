import { describe, expect, it } from 'vitest';
import type { VenueDetail, VenueSubmissionRecord } from '@/types';
import { venueTagDictionaryFixture as dictionary } from '@/test/venueTagDictionary.fixture';
import { toTagFormState } from './adminVenueTagFields';
import {
  SUPPLEMENT_FOOTER,
  buildFeeAnswerLines,
  buildInitialTagFields,
  buildSubmissionSupplement,
  buildSuggestionSummary,
  getSourceMarker,
  isSubmissionPending,
  submittedOnTaipei,
} from './adminVenueSubmission';

const submission = (overrides: Partial<VenueSubmissionRecord> = {}): VenueSubmissionRecord => ({
  submittedAt: '2026-10-14T17:00:00Z',
  confirmedAt: null,
  suggestedTags: [
    { slug: 'free_venue', source: 'store' },
    { slug: 'can_decorate', source: 'auto' },
  ],
  answers: {
    uses: { options: ['goods_distribution'] },
    services: { options: [] },
    spaceTypes: { options: ['cafe'] },
    sourceLinks: ['https://a.example/1', 'https://b.example/2'],
    note: '可租扭蛋機和投影機',
  },
  ...overrides,
});

const venue = (overrides: Partial<VenueDetail> = {}) =>
  ({
    tags: [{ slug: 'goods_distribution' }],
    sourceLinks: [],
    equipmentNote: '',
    infoUpdatedOn: null,
    calendarUrl: 'https://timetree.app/x',
    ...overrides,
  }) as VenueDetail;

describe('isSubmissionPending / submittedOnTaipei', () => {
  it('有 submission 且 confirmedAt 是 null 才算待確認', () => {
    expect(isSubmissionPending(undefined)).toBe(false);
    expect(isSubmissionPending(submission())).toBe(true);
    expect(isSubmissionPending(submission({ confirmedAt: '2026-10-20T00:00:00Z' }))).toBe(false);
  });

  it('投稿日用台灣時間（UTC 10-14 17:00 = 台北 10-15）；也吃 Firestore Timestamp', () => {
    expect(submittedOnTaipei('2026-10-14T17:00:00Z')).toBe('2026-10-15');
    expect(
      submittedOnTaipei({ _seconds: Date.parse('2026-10-14T17:00:00Z') / 1000, _nanoseconds: 0 })
    ).toBe('2026-10-15');
  });
});

describe('TC-010 預填值', () => {
  it('待確認：標籤照建議、連結照投稿順序、設備原文不從 note 帶、日期是台灣投稿日、行事曆用既有值', () => {
    expect(buildInitialTagFields(venue({ submission: submission() }))).toEqual({
      tags: [{ slug: 'free_venue' }, { slug: 'can_decorate' }],
      sourceLinks: ['https://a.example/1', 'https://b.example/2'],
      equipmentNote: '',
      infoUpdatedOn: '2026-10-15',
      calendarUrl: 'https://timetree.app/x',
    });
  });

  it('TC-060 已確認：用正式欄位，不用建議', () => {
    expect(
      buildInitialTagFields(
        venue({ submission: submission({ confirmedAt: '2026-10-16T00:00:00Z' }) })
      ).tags
    ).toEqual([{ slug: 'goods_distribution' }]);
  });
});

describe('TC-010 來源標記', () => {
  const suggested = submission().suggestedTags;

  it.each([
    { slug: 'free_venue', checked: true, expected: '店家建議' },
    { slug: 'can_decorate', checked: true, expected: '自動帶入' },
    { slug: 'deposit', checked: true, expected: '管理員新增' },
    { slug: 'free_venue', checked: false, expected: '店家建議・未採用' },
    { slug: 'deposit', checked: false, expected: null },
  ])('$slug checked=$checked → $expected', ({ slug, checked, expected }) => {
    expect(getSourceMarker(slug, checked, suggested)).toBe(expected);
  });

  it('差異摘要列出自動帶入、新增、未採用', () => {
    const state = toTagFormState({
      tags: [{ slug: 'can_decorate' }, { slug: 'deposit' }],
      sourceLinks: [],
      equipmentNote: '',
      infoUpdatedOn: null,
      calendarUrl: null,
    });
    expect(buildSuggestionSummary(state.entries, suggested, dictionary)).toBe(
      '跟店家建議相比：自動帶入 可佈置；新增 需押金；未採用 免場地費'
    );
  });
});

describe('TC-067「店家投稿時補充」', () => {
  it('照原文顯示 note，加一句「還沒確定」，最後一句固定', () => {
    const lines = buildSubmissionSupplement({
      ...submission().answers,
      note: '保證金撤展後退還\n可租扭蛋機',
      services: { options: [], discussable: true },
    });
    expect(lines).toEqual({
      note: '保證金撤展後退還\n可租扭蛋機',
      remarks: ['服務：店家勾了「還沒確定，想先跟主辦聊聊」'],
      footer: SUPPLEMENT_FOOTER,
    });
  });

  it('沒寫也沒勾時不出現', () => {
    expect(buildSubmissionSupplement({ ...submission().answers, note: undefined })).toBeNull();
  });
});

describe('TC-140「店家投稿時的回答」', () => {
  it('a：只答押金 → 押金：不用，場地費和保底寫「沒答」', () => {
    expect(
      buildFeeAnswerLines({
        ...submission().answers,
        uses: { options: ['can_decorate'] },
        fees: { deposit: 'no' },
      })
    ).toEqual(['場地費：沒答', '保底：沒答', '押金：不用']);
  });

  it('b：沒有選佈置 → 一句說明', () => {
    expect(buildFeeAnswerLines(submission().answers)).toEqual(['沒有選佈置、辦生咖，不用答費用']);
  });
});
