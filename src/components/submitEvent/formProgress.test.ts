import { describe, expect, it } from 'vitest';
import { computeEventFormProgress, EventFormProgressInput } from './formProgress';

const emptyInput: EventFormProgressInput = {
  title: '',
  startDate: '',
  endDate: '',
  addressName: '',
  mainImage: '',
  instagram: '',
  threads: '',
};

describe('computeEventFormProgress', () => {
  it('回傳 0 / 5 當所有必填欄位都未填寫', () => {
    const result = computeEventFormProgress(emptyInput);

    expect(result).toEqual({
      completed: 0,
      total: 5,
      segments: [false, false, false, false, false],
    });
  });

  it('只計算已填寫的欄位，日期需起訖都填才算完成', () => {
    const result = computeEventFormProgress({
      ...emptyInput,
      title: '生日應援活動',
      startDate: '2026-01-01',
      // endDate 未填，日期起訖視為未完成
      instagram: 'stellar_tw',
    });

    expect(result.completed).toBe(2);
    expect(result.total).toBe(5);
    expect(result.segments).toEqual([true, false, false, false, true]);
  });

  it('回傳 5 / 5 當所有必填欄位皆已填寫（社群媒體任一即可）', () => {
    const result = computeEventFormProgress({
      title: '生日應援活動',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
      addressName: '留白咖啡',
      mainImage: 'https://example.com/image.jpg',
      instagram: '',
      threads: '_stellar.tw',
    });

    expect(result).toEqual({
      completed: 5,
      total: 5,
      segments: [true, true, true, true, true],
    });
  });
});
