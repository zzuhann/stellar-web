// 投稿表單「必填欄位完成度」計算，僅供進度條顯示用，不影響 Zod 送出驗證邏輯
export interface EventFormProgressInput {
  title: string;
  startDate: string;
  endDate: string;
  addressName: string;
  mainImage: string;
  instagram: string;
  threads: string;
}

export interface EventFormProgress {
  completed: number;
  total: number;
  segments: boolean[];
}

export function computeEventFormProgress(input: EventFormProgressInput): EventFormProgress {
  const segments = [
    !!input.title?.trim(),
    !!input.startDate && !!input.endDate,
    !!input.addressName?.trim(),
    !!input.mainImage?.trim(),
    !!(input.instagram?.trim() || input.threads?.trim()),
  ];

  return {
    completed: segments.filter(Boolean).length,
    total: segments.length,
    segments,
  };
}
