'use client';

import { useMutation } from '@tanstack/react-query';
import { importApi } from '@/lib/api';

/**
 * 貼文文案原文 → Gemini 結構化解析。這支 hook 只負責發送請求，
 * 「合併規則」與「這次新增了哪些欄位」的判斷交給呼叫端（見 utils/mergeParsedCaption）。
 */
export function useParseCaptionMutation() {
  return useMutation({
    mutationFn: (caption: string) => importApi.parseCaption(caption),
  });
}
