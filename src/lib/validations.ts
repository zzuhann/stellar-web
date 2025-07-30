// 表單驗證 schemas

import { z } from 'zod';

// 登入表單驗證
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, '請輸入電子郵件')
    .email('請輸入正確的電子郵件格式'),
  password: z
    .string()
    .min(1, '請輸入密碼')
    .min(6, '密碼至少需要6個字元'),
});

// 註冊表單驗證
export const signUpSchema = z.object({
  displayName: z
    .string()
    .min(1, '請輸入顯示名稱')
    .min(2, '顯示名稱至少需要2個字元')
    .max(50, '顯示名稱不能超過50個字元'),
  email: z
    .string()
    .min(1, '請輸入電子郵件')
    .email('請輸入正確的電子郵件格式'),
  password: z
    .string()
    .min(1, '請輸入密碼')
    .min(6, '密碼至少需要6個字元')
    .max(128, '密碼不能超過128個字元'),
  confirmPassword: z
    .string()
    .min(1, '請確認密碼'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼確認不匹配',
  path: ['confirmPassword'],
});

// 重設密碼表單驗證
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '請輸入電子郵件')
    .email('請輸入正確的電子郵件格式'),
});

// 活動投稿表單驗證
export const eventSubmissionSchema = z.object({
  title: z
    .string()
    .min(1, '請輸入活動標題')
    .min(5, '活動標題至少需要5個字元')
    .max(100, '活動標題不能超過100個字元'),
  artistName: z
    .string()
    .min(1, '請輸入藝人名稱')
    .min(2, '藝人名稱至少需要2個字元')
    .max(50, '藝人名稱不能超過50個字元'),
  description: z
    .string()
    .max(1000, '活動描述不能超過1000個字元')
    .optional(),
  startDate: z
    .string()
    .min(1, '請選擇開始日期'),
  endDate: z
    .string()
    .min(1, '請選擇結束日期'),
  address: z
    .string()
    .min(1, '請輸入活動地址')
    .min(10, '請輸入完整的活動地址')
    .max(200, '地址不能超過200個字元'),
  phone: z
    .string()
    .regex(/^09\d{8}$/, '請輸入正確的台灣手機號碼格式 (09xxxxxxxx)')
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .regex(/^@?[\w.]+$/, '請輸入正確的 Instagram 帳號格式')
    .optional()
    .or(z.literal('')),
  facebook: z
    .string()
    .url('請輸入正確的 Facebook 連結格式')
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: '結束日期必須晚於或等於開始日期',
  path: ['endDate'],
});

// 型別導出
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type EventSubmissionFormData = z.infer<typeof eventSubmissionSchema>;