import { describe, it, expect } from 'vitest';
import { eventSubmissionSchema } from './validations';

const validData = {
  title: '測試活動',
  artistIds: ['artist-1'],
  description: '活動描述',
  startDate: '2025-06-10',
  endDate: '2025-06-11',
  addressName: '台北市信義區',
  instagram: 'test_account',
  threads: '',
  mainImage: 'https://r2.example.com/image.jpg',
  detailImage: [],
};

describe('eventSubmissionSchema', () => {
  it('合法資料通過驗證', () => {
    expect(eventSubmissionSchema.safeParse(validData).success).toBe(true);
  });

  it('mainImage 為空字串時驗證失敗', () => {
    const result = eventSubmissionSchema.safeParse({ ...validData, mainImage: '' });
    expect(result.success).toBe(false);
  });

  it('endDate 早於 startDate 驗證失敗', () => {
    const result = eventSubmissionSchema.safeParse({
      ...validData,
      startDate: '2025-06-10',
      endDate: '2025-06-09',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === '結束日期必須晚於或等於開始日期')).toBe(
        true
      );
    }
  });

  it('endDate 等於 startDate 通過驗證', () => {
    const result = eventSubmissionSchema.safeParse({
      ...validData,
      startDate: '2025-06-10',
      endDate: '2025-06-10',
    });
    expect(result.success).toBe(true);
  });

  it('instagram 和 threads 都空時驗證失敗', () => {
    const result = eventSubmissionSchema.safeParse({
      ...validData,
      instagram: '',
      threads: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '請至少填寫一個社群媒體帳號（Instagram 或 Threads）'
        )
      ).toBe(true);
    }
  });

  it('只填 threads 通過社群媒體驗證', () => {
    const result = eventSubmissionSchema.safeParse({
      ...validData,
      instagram: '',
      threads: 'test_threads',
    });
    expect(result.success).toBe(true);
  });

  describe('日期嚴格驗證（擋下 Date 會自動正規化的無效日期）', () => {
    it('startDate 是不存在的日期（2 月 30 日）時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        startDate: '2026-02-30',
        endDate: '2026-03-01',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === '請選擇有效的開始日期')).toBe(true);
      }
    });

    it('endDate 是不存在的日期（4 月 31 日）時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        startDate: '2026-04-01',
        endDate: '2026-04-31',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === '請選擇有效的結束日期')).toBe(true);
      }
    });

    it('非閏年的 2 月 29 日驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        startDate: '2026-02-29',
        endDate: '2026-03-01',
      });
      expect(result.success).toBe(false);
    });

    it('閏年的 2 月 29 日通過驗證', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        startDate: '2028-02-29',
        endDate: '2028-03-01',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('預約資訊', () => {
    it('三個預約欄位皆未填時通過驗證', () => {
      const result = eventSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('只填預約網址時通過驗證', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://forms.gle/xxxx',
      });
      expect(result.success).toBe(true);
    });

    it('預約網址格式不合法時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === '請輸入正確的網址格式（需以 http:// 或 https:// 開頭）'
          )
        ).toBe(true);
      }
    });

    it('殘缺網址（只有 protocol 沒有 host）驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === '請輸入正確的網址格式（需以 http:// 或 https:// 開頭）'
          )
        ).toBe(true);
      }
    });

    it('非 http(s) protocol（例如 javascript:）驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'javascript:alert(1)',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === '請輸入正確的網址格式（需以 http:// 或 https:// 開頭）'
          )
        ).toBe(true);
      }
    });

    it('結構完整的合法網址通過驗證', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://forms.gle/xxxx?query=1',
      });
      expect(result.success).toBe(true);
    });

    it('只填預約日期沒填時間時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationDate: '2026-08-20',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message === '請同時選擇日期與時間，或都不填')
        ).toBe(true);
      }
    });

    it('只填預約時間沒填日期時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationTime: '20:00',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message === '請同時選擇日期與時間，或都不填')
        ).toBe(true);
      }
    });

    it('填了日期與時間但沒填網址時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationDate: '2026-08-20',
        reservationTime: '20:00',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === '請填寫預約網址')).toBe(true);
      }
    });

    it('網址、日期、時間皆填寫時通過驗證', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://forms.gle/xxxx',
        reservationDate: '2026-08-20',
        reservationTime: '20:00',
      });
      expect(result.success).toBe(true);
    });

    it('reservationDate 是不存在的日期（2 月 30 日）時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://forms.gle/xxxx',
        reservationDate: '2026-02-30',
        reservationTime: '20:00',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === '請選擇有效的預約時間')).toBe(true);
      }
    });

    it('reservationTime 是不合法時間（24:00）時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://forms.gle/xxxx',
        reservationDate: '2026-08-20',
        reservationTime: '24:00',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === '請選擇有效的預約時間')).toBe(true);
      }
    });

    it('reservationTime 格式錯誤（非 HH:mm）時驗證失敗', () => {
      const result = eventSubmissionSchema.safeParse({
        ...validData,
        reservationUrl: 'https://forms.gle/xxxx',
        reservationDate: '2026-08-20',
        reservationTime: '9:5',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === '請選擇有效的預約時間')).toBe(true);
      }
    });
  });
});
