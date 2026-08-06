// 表單驗證 schemas

import { z } from 'zod';
import { isHttpUrl, isValidCalendarDateString } from '@/utils';
import { isValidTimeString } from '@/components/TimePicker/utils';

// 活動投稿表單驗證
export const eventSubmissionSchema = z
  .object({
    title: z.string().min(1, '請輸入標題').max(100, '標題不能超過 100 個字'),
    artistIds: z.array(z.string()).min(1, '請至少選擇一個藝人').max(10, '最多只能選擇 10 個藝人'),
    description: z.string().max(1500, '描述不能超過 1500 個字').optional(),
    startDate: z
      .string()
      .min(1, '請選擇開始日期')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '請選擇有效的開始日期')
      .refine((date) => isValidCalendarDateString(date), '請選擇有效的開始日期'),
    endDate: z
      .string()
      .min(1, '請選擇結束日期')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '請選擇有效的結束日期')
      .refine((date) => isValidCalendarDateString(date), '請選擇有效的結束日期'),
    addressName: z.string().min(1, '請輸入地點').max(200, '地址不能超過200個字'),
    instagram: z.string().optional().or(z.literal('')),
    threads: z.string().optional().or(z.literal('')),
    mainImage: z.string().min(1, '請上傳主視覺圖片'),
    detailImage: z.array(z.string()).max(10, '詳細說明圖片最多上傳10張').optional(),
    reservationUrl: z.string().trim().optional().or(z.literal('')),
    reservationDate: z.string().optional().or(z.literal('')),
    reservationTime: z.string().optional().or(z.literal('')),
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
      const hasThreads = data.threads && data.threads.trim() !== '';
      return hasInstagram || hasThreads;
    },
    {
      message: '請至少填寫一個社群媒體帳號（Instagram 或 Threads）',
      path: ['instagram'],
    }
  )
  .refine((data) => !data.reservationUrl || isHttpUrl(data.reservationUrl), {
    message: '請輸入正確的網址格式（需以 http:// 或 https:// 開頭）',
    path: ['reservationUrl'],
  })
  .refine(
    (data) => {
      const hasDate = !!data.reservationDate;
      const hasTime = !!data.reservationTime;
      return hasDate === hasTime;
    },
    {
      message: '請同時選擇日期與時間，或都不填',
      path: ['reservationTime'],
    }
  )
  .refine(
    (data) => {
      const hasStartAt = !!data.reservationDate && !!data.reservationTime;
      const hasUrl = !!data.reservationUrl;
      return !hasStartAt || hasUrl;
    },
    {
      message: '請填寫預約網址',
      path: ['reservationUrl'],
    }
  )
  .refine(
    (data) => {
      if (!data.reservationDate || !data.reservationTime) return true;
      if (!isValidCalendarDateString(data.reservationDate)) return false;
      // 重用 TimePicker 自己的 HH:mm 驗證邏輯，不要用 Date.parse 重新做一次不完整的
      // 驗證——Date.parse(`${date}T${time}:00`) 會放行 24:00 這種不合法時間（之後被
      // 靜默組成隔日午夜），isValidTimeString 才會正確擋下
      return isValidTimeString(data.reservationTime);
    },
    {
      message: '請選擇有效的預約時間',
      path: ['reservationTime'],
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
    .min(1, '請上傳藝人照片')
    .refine((val) => val === 'pending' || /^https?:\/\//.test(val), '請輸入正確的圖片連結格式'),
});

export type ArtistSubmissionFormData = z.infer<typeof artistSubmissionSchema>;
