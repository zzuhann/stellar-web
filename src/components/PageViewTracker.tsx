'use client';

import { usePageView } from '@/hooks/usePageView';

interface PageViewTrackerProps {
  eventPage: string;
  contentId?: string;
}

/**
 * 頁面瀏覽追蹤元件
 * 用於在 Server Component 中追蹤頁面瀏覽
 */
export default function PageViewTracker({ eventPage, contentId }: PageViewTrackerProps) {
  usePageView({ eventPage, contentId });
  return null;
}
