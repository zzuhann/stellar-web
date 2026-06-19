import EditEventClient from './EditEventClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventEditPage({ params }: PageProps) {
  const { id } = await params;
  return <EditEventClient id={id} />;
}
