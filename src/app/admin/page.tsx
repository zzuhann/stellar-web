import PageAdmin from '@/components/admin/PageAdmin';
import Loading from '@/components/Loading';
import { Suspense } from 'react';

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading style={{ height: '100dvh' }} />}>
      <PageAdmin />
    </Suspense>
  );
}
