import { useMutation } from '@tanstack/react-query';
import { handleApiError, venueSubmissionApi } from '@/lib/api';
import type { CreateVenueSubmissionData } from '@/types';

export function useSubmitVenueMutation(options: { onError: (message: string) => void }) {
  return useMutation({
    mutationFn: (data: CreateVenueSubmissionData) => venueSubmissionApi.create(data),
    onError: (error) => options.onError(handleApiError(error, '投稿失敗，請稍後再試')),
  });
}
