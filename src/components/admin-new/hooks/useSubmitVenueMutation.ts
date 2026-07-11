import { useMutation } from '@tanstack/react-query';
import { handleApiError, venueSubmissionApi } from '@/lib/api';
import type { CreateVenueData } from '@/types';

export function useSubmitVenueMutation(options: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  return useMutation({
    mutationFn: (data: CreateVenueData) => venueSubmissionApi.create(data),
    onSuccess: options.onSuccess,
    onError: (error) => options.onError(handleApiError(error, '投稿失敗，請稍後再試')),
  });
}
