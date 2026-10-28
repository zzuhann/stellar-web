import { describe, expect, it } from 'vitest';
import { createEmptyForm } from './venueSubmitModel';
import {
  DRAFT_VERSION,
  parseDraft,
  parseStepParam,
  resolveInitialStep,
  serializeDraft,
  type VenueSubmitDraft,
} from './venueSubmitDraft';

function draft(overrides: Partial<VenueSubmitDraft> = {}): VenueSubmitDraft {
  return { version: DRAFT_VERSION, form: createEmptyForm(), maxStep: 2, depth: 1, ...overrides };
}

describe('TC-101 決定初始步驟', () => {
  it('a：沒有暫存、網址 ?step=3 → 第 1 步', () => {
    expect(resolveInitialStep(parseStepParam('?step=3'), null)).toBe(1);
  });

  it('b：暫存最遠步驟是 2、網址 ?step=3 → 第 2 步', () => {
    expect(resolveInitialStep(parseStepParam('?step=3'), draft({ maxStep: 2 }))).toBe(2);
  });

  it('網址步驟沒超過最遠步驟 → 停在網址那一步', () => {
    expect(resolveInitialStep(parseStepParam('?step=2'), draft({ maxStep: 3 }))).toBe(2);
  });
});

describe('TC-102 step 不合法一律當第 1 步', () => {
  it.each(['?step=0', '?step=4', '?step=abc', '?step=2.5', '?step=', ''])('%j', (search) => {
    expect(resolveInitialStep(parseStepParam(search), draft({ maxStep: 3 }))).toBe(1);
  });
});

describe('TC-104 丟棄暫存', () => {
  const valid = serializeDraft(draft());

  it('合法暫存可以讀回', () => {
    expect(parseDraft(valid)?.maxStep).toBe(2);
  });

  it.each([
    { name: '版本號不同', raw: valid.replace(`"version":${DRAFT_VERSION}`, '"version":999') },
    {
      name: '4 步版留下的暫存（舊版本號、最遠步驟 4）',
      raw: JSON.stringify({ ...JSON.parse(valid), version: DRAFT_VERSION - 1, maxStep: 4 }),
    },
    {
      name: '目前版本號但最遠步驟是 4',
      raw: JSON.stringify({ ...JSON.parse(valid), maxStep: 4 }),
    },
    { name: 'JSON 壞掉', raw: '{"version":' },
    {
      name: '缺 uses',
      raw: JSON.stringify({
        ...JSON.parse(valid),
        form: { ...JSON.parse(valid).form, uses: undefined },
      }),
    },
    {
      name: 'transitStops 不是陣列',
      raw: JSON.stringify({
        ...JSON.parse(valid),
        form: { ...JSON.parse(valid).form, transitStops: 'x' },
      }),
    },
    { name: '空值', raw: null },
  ])('$name → 當成沒有暫存', ({ raw }) => {
    expect(parseDraft(raw)).toBeNull();
  });

  it('沒有暫存時：第 1 步、欄位全空', () => {
    const restored = parseDraft('not json');
    expect(resolveInitialStep(parseStepParam('?step=3'), restored)).toBe(1);
  });
});

describe('暫存只存已傳完的照片', () => {
  it('上傳中的其他照片（url 是 null）不寫進暫存', () => {
    const form = {
      ...createEmptyForm(),
      otherPhotos: [
        { id: 'a', url: 'https://cdn.test/p0.jpg' },
        { id: 'b', url: null },
      ],
    };
    const raw = serializeDraft(draft({ form }));
    expect(raw).not.toContain('blob:');
    expect(parseDraft(raw)?.form.otherPhotos.map((p) => p.url)).toEqual([
      'https://cdn.test/p0.jpg',
    ]);
  });
});
