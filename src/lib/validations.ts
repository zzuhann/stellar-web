// 表單驗證 schemas

import { z } from 'zod';

// 活動投稿表單驗證
export const eventSubmissionSchema = z
  .object({
    title: z.string().min(1, '請輸入標題').max(100, '標題不能超過 100 個字'),
    artistIds: z.array(z.string()).min(1, '請至少選擇一個偶像').max(10, '最多只能選擇 10 個偶像'),
    description: z.string().max(1500, '描述不能超過 1500 個字').optional(),
    startDate: z
      .string()
      .min(1, '請選擇開始日期')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '請選擇有效的開始日期')
      .refine((date) => !isNaN(Date.parse(date)), '請選擇有效的開始日期'),
    endDate: z
      .string()
      .min(1, '請選擇結束日期')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '請選擇有效的結束日期')
      .refine((date) => !isNaN(Date.parse(date)), '請選擇有效的結束日期'),
    addressName: z.string().min(1, '請輸入地點').max(200, '地址不能超過200個字'),
    instagram: z.string().optional().or(z.literal('')),
    x: z.string().optional().or(z.literal('')),
    threads: z.string().optional().or(z.literal('')),
    mainImage: z.string().min(1, '請上傳主視覺圖片'),
    detailImage: z.array(z.string()).max(5, '詳細說明圖片最多上傳5張').optional(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate >= startDate;
    },
    {
      message: '結束日期必須晚於或等於開始日期',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const hasInstagram = data.instagram && data.instagram.trim() !== '';
      const hasX = data.x && data.x.trim() !== '';
      const hasThreads = data.threads && data.threads.trim() !== '';
      return hasInstagram || hasX || hasThreads;
    },
    {
      message: '請至少填寫一個社群媒體帳號（Instagram、X 或 Threads）',
      path: ['instagram'],
    }
  );

export type EventSubmissionFormData = z.infer<typeof eventSubmissionSchema>;

// 藝人投稿表單驗證
export const artistSubmissionSchema = z.object({
  stageName: z.string().min(1, '請輸入英文藝名').max(50, '英文藝名不能超過50個字元'),
  stageNameZh: z.string().max(50, '中文藝名不能超過50個字元').optional().or(z.literal('')),
  realName: z.string().max(50, '本名不能超過50個字元').optional().or(z.literal('')),
  birthday: z
    .string()
    .min(1, '請填寫生日')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '請選擇有效的生日日期')
    .refine((date) => !isNaN(Date.parse(date)), '請選擇有效的生日日期'),
  profileImage: z
    .string()
    .min(1, '請上傳偶像照片')
    .refine((val) => val === 'pending' || /^https?:\/\//.test(val), '請輸入正確的圖片連結格式'),
});

export type ArtistSubmissionFormData = z.infer<typeof artistSubmissionSchema>;
