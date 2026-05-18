import { notFound } from 'next/navigation';
import VenueFormClient from '@/components/admin/VenueForm';
import DeactivateVenueSection from './DeactivateVenueSection';
import { venueApi } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditVenuePage({ params }: Props) {
  const { id } = await params;

  let venue;
  try {
    venue = await venueApi.getVenueById(id);
  } catch {
    notFound();
  }

  return (
    <>
      <VenueFormClient mode="edit" venue={venue} />
      <DeactivateVenueSection venueId={id} currentStatus={venue.status} />
    </>
  );
}
