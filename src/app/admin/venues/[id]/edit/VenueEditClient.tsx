'use client';

import { useQuery } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import VenueFormClient from '@/components/admin/VenueForm';
import DeactivateVenueSection from './DeactivateVenueSection';
import queryKey from '@/hooks/queryKey';

export default function VenueEditClient({ id }: { id: string }) {
  const { data: venue, isLoading } = useQuery({
    queryKey: queryKey.venueDetail(id),
    queryFn: () => venueApi.getAdminVenueById(id),
  });

  if (isLoading) return null;
  if (!venue) return <p>找不到場地</p>;

  return (
    <>
      <VenueFormClient mode="edit" venue={venue} />
      <DeactivateVenueSection venueId={id} currentStatus={venue.status} events={venue.events} />
    </>
  );
}
