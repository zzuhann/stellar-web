import EditArtistClient from './EditArtistClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArtistEditPage({ params }: PageProps) {
  const { id } = await params;
  return <EditArtistClient id={id} />;
}
