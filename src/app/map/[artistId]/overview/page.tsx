import { Metadata } from 'next';

export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

interface MapOverviewPageProps {
  params: Promise<{ artistId: string }>;
}

export async function generateMetadata(_props: MapOverviewPageProps): Promise<Metadata> {
  return {};
}

// Skeleton only: implemented after the tests are in place
export default async function MapOverviewPage(_props: MapOverviewPageProps): Promise<never> {
  throw new Error('not implemented');
}
