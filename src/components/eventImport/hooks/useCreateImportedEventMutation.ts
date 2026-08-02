'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import { CreateEventRequest } from '@/types';

/**
 * 建立活動沿用既有 `POST /api/events`（eventsApi.create），不需要新 API
 * （design-backend.md〈現狀 Audit〉）。這支 hook 只是這個匯入頁面專屬的
 * 成功/失敗處理（導回 `/admin-new/events`），不重用 submitEvent 的
 * useCreateEventMutation，因為那支 hook 的導頁與 GA event_page 綁定公開投稿頁語意。
 */
export function useCreateImportedEventMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (eventData: CreateEventRequest) => eventsApi.create(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      showToast.success('活動建立成功，已進入待審核');
      router.push('/admin-new/events');
    },
    onError: (error) => {
      showToast.error(handleApiError(error, '建立活動失敗'));
    },
  });
}
