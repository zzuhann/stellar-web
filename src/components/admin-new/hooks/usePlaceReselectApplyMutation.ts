import { useMutation, useQueryClient } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import { revalidatePublicPages } from '@/lib/revalidate';
import queryKey from '@/hooks/queryKey';
import type { PlaceReselectAddressChoice, VenueDetail } from '@/types';

export function usePlaceReselectApplyMutation(venueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { placeId: string; addressChoice?: PlaceReselectAddressChoice }) =>
      venueApi.applyPlaceReselect(venueId, body),
    onSuccess: (result) => {
      // Show the new place immediately; the invalidation below then refetches the full detail
      queryClient.setQueryData<VenueDetail>(queryKey.venueDetail(venueId), (old) =>
        old
          ? {
              ...old,
              placeId: result.placeId,
              lat: result.lat,
              lng: result.lng,
              address: result.address,
            }
          : old
      );
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      revalidatePublicPages();
    },
  });
}
