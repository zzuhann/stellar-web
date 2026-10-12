import { useMutation } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';

// A mutation (not a query): preview calls Google Places every time, so it must only run on demand
export function usePlaceReselectPreviewMutation(venueId: string) {
  return useMutation({
    mutationFn: (placeId: string) => venueApi.previewPlaceReselect(venueId, placeId),
  });
}
