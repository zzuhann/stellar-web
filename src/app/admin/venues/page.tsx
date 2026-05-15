import Loading from '@/components/Loading';
import PageVenues from '@/components/admin/venues/PageVenues';
import { Suspense } from 'react';

export default function AdminVenuesPage() {
  return (
    <Suspense fallback={<Loading style={{ height: '100dvh' }} />}>
      <PageVenues />
    </Suspense>
  );
}
