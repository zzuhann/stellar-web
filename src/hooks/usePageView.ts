'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

interface PageViewParams {
  eventPage: string;
  contentId?: string;
}

/**
 * 追蹤頁面瀏覽事件
 * 頁面載入時自動發送 page_view 事件到 GA4
 */
export function usePageView({ eventPage, contentId = '' }: PageViewParams) {
  const { user } = useAuth();

  useEffect(() => {
    sendGAEvent('event', 'page_view', {
      event_page: eventPage,
      user_id: user?.uid ?? '',
      content_id: contentId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
