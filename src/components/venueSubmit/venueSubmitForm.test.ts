import { describe, expect, it } from 'vitest';
import { createTransitRow } from '@/utils/transitStops';
import {
  FEES_REQUIRED_ERROR,
  OPTION_OR_UNSURE_ERROR,
  createEmptyForm,
  buildSubmissionPayload,
  hasAnyInput,
  validateAllSteps,
  validateStep,
  type VenueSubmitFormValues,
} from './venueSubmitForm';

const TODAY = '2026-10-28';

function step2Filled(overrides: Partial<VenueSubmitFormValues> = {}): VenueSubmitFormValues {
  return {
    ...createEmptyForm(),
    uses: { options: ['goods_distribution'], discussable: false },
    services: { options: ['custom_menu'], discussable: false },
    spaceTypes: ['cafe'],
    ...overrides,
  };
}

describe('TC-052「還沒確定」「要看檔期和方案」算有填', () => {
  it.each([
    {
      name: 'A 只有 discussable',
      form: step2Filled({ uses: { options: [], discussable: true } }),
    },
    {
      name: 'C 只有 discussable',
      form: step2Filled({ services: { options: [], discussable: true } }),
    },
    {
      name: 'A 有 can_decorate、B 只有 discussable',
      form: step2Filled({
        uses: { options: ['can_decorate'], discussable: false },
        fees: { ...createEmptyForm().fees, discussable: true },
      }),
    },
  ])('$name → 通過', ({ form }) => {
    expect(validateStep(2, form, TODAY)).toEqual({});
  });

  it('A、C 沒選也沒勾、D 沒選 → 三題各自的錯誤；沒勾佈置時 B 不驗', () => {
    expect(validateStep(2, createEmptyForm(), TODAY)).toEqual({
      uses: OPTION_OR_UNSURE_ERROR,
      services: OPTION_OR_UNSURE_ERROR,
      spaceTypes: '請至少選一項。',
    });
  });

  it('勾佈置但 B 三題都沒答也沒勾 → 費用區塊錯誤', () => {
    const form = step2Filled({ uses: { options: ['can_decorate'], discussable: false } });
    expect(validateStep(2, form, TODAY)).toEqual({ fees: FEES_REQUIRED_ERROR });
  });

  it('限時優惠日期早於今天 →「請重新選擇日期」；取消限期就不驗', () => {
    const fees = {
      ...createEmptyForm().fees,
      venueFee: 'free' as const,
      freeVenueLimited: true,
      freeVenueUntil: '2026-10-27',
    };
    const form = step2Filled({ uses: { options: ['can_decorate'], discussable: false }, fees });
    expect(validateStep(2, form, TODAY)).toEqual({ freeVenueUntil: '請重新選擇日期' });
    expect(validateStep(2, { ...form, fees: { ...fees, freeVenueLimited: false } }, TODAY)).toEqual(
      {}
    );
  });
});

describe('validateAllSteps', () => {
  it('回報第一個有錯的步驟', () => {
    const form = step2Filled();
    expect(validateAllSteps(form, TODAY).firstStep).toBe(1);
    expect(validateAllSteps({ ...createEmptyForm() }, TODAY).firstStep).toBe(1);
  });
});

describe('buildSubmissionPayload', () => {
  const complete = (): VenueSubmitFormValues => ({
    ...step2Filled(),
    place: { placeId: 'place-1', label: 'A 咖啡', address: '台北市 1 號', lat: 25, lng: 121 },
    name: ' A 咖啡 ',
    region: '台北',
    capacityRange: '20-40',
    preferredContact: 'instagram',
    instagram: 'stellar_cafe',
    coverPhoto: 'https://cdn.test/cover.jpg',
  });

  it('沒選佈置時不帶 fees；空的選填欄位不送；transitStops 全空送 []', () => {
    const payload = buildSubmissionPayload({
      ...complete(),
      fees: { ...createEmptyForm().fees, venueFee: 'paid', deposit: 'yes' },
      note: '   ',
    });
    expect(payload.venueConditions).toEqual({
      uses: { options: ['goods_distribution'] },
      services: { options: ['custom_menu'] },
      spaceTypes: { options: ['cafe'] },
    });
    expect(payload.transitStops).toEqual([]);
    expect(payload).not.toHaveProperty('bookingFormUrl');
    expect(payload).not.toHaveProperty('contactUrl');
    expect(payload).not.toHaveProperty('hostTags');
    expect(payload.name).toBe('A 咖啡');
  });

  it('取消限期時不帶日期；改成要場地費時限期與日期都不帶', () => {
    const base = {
      ...complete(),
      uses: { options: ['can_decorate' as const], discussable: false },
    };
    const fees = {
      ...createEmptyForm().fees,
      venueFee: 'free' as const,
      freeVenueLimited: false,
      freeVenueUntil: '2026-12-31',
    };
    expect(buildSubmissionPayload({ ...base, fees }).venueConditions.fees).toEqual({
      venueFee: 'free',
    });
    expect(
      buildSubmissionPayload({
        ...base,
        fees: { ...fees, venueFee: 'paid', freeVenueLimited: true },
      }).venueConditions.fees
    ).toEqual({ venueFee: 'paid' });
  });

  it('LINE 才帶 contactUrl', () => {
    const payload = buildSubmissionPayload({
      ...complete(),
      preferredContact: 'line',
      contactUrl: ' https://lin.ee/x ',
      transitStops: [createTransitRow({ type: 'mrt', station: '中山', walkMinutes: '0' })],
    });
    expect(payload.contactUrl).toBe('https://lin.ee/x');
    expect(payload.transitStops).toEqual([{ type: 'mrt', station: '中山', walkMinutes: 0 }]);
  });
});

describe('hasAnyInput', () => {
  it('空白表單（含一列空白交通）算沒填；填任一欄算有填', () => {
    expect(hasAnyInput(createEmptyForm())).toBe(false);
    expect(hasAnyInput({ ...createEmptyForm(), region: '台北' })).toBe(true);
    expect(
      hasAnyInput({ ...createEmptyForm(), transitStops: [createTransitRow({ station: '中山' })] })
    ).toBe(true);
  });
});
