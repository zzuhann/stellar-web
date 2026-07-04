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
});
