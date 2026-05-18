import VenueEditClient from './VenueEditClient';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditVenuePage({ params }: Props) {
  const { id } = await params;
  return <VenueEditClient id={id} />;
}
