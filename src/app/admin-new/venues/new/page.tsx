'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { venueApi, handleApiError } from '@/lib/api';
import { useAuthToken } from '@/hooks/useAuthToken';
import VenueForm from '@/components/admin-new/VenueForm';
import type { CreateVenueData } from '@/types';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  paddingTop: '70px',
  background: 'color.background.primary',
  justifyContent: 'center',
});

const container = css({
  width: '100%',
  maxWidth: '640px',
  paddingX: '4',
  paddingY: '6',
  md: {
    paddingX: '6',
    paddingY: '8',
  },
});

const backLink = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
  textDecoration: 'none',
  marginBottom: '5',
  '&:hover': { color: 'color.text.primary' },
  '& svg': { width: '14px', height: '14px' },
});

const pageTitle = css({
  textStyle: 'h3',
  color: 'color.text.primary',
  margin: 0,
  marginBottom: '6',
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueNewPage() {
  const router = useRouter();
  const { token } = useAuthToken();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateVenueData) => venueApi.createVenue(data),
    onSuccess: () => router.push('/admin-new/venues'),
    onError: (err) => setSubmitError(handleApiError(err)),
  });

  return (
    <div className={pageWrapper}>
      <div className={container}>
        <Link href="/admin-new/venues" className={backLink}>
          <ChevronLeftIcon aria-hidden="true" />
          返回場地列表
        </Link>
        <h1 className={pageTitle}>新增場地</h1>
        <VenueForm
          mode="create"
          onSubmit={(data) => {
            setSubmitError(null);
            mutation.mutate(data);
          }}
          isSubmitting={mutation.isPending}
          submitError={submitError}
          authToken={token || undefined}
        />
      </div>
    </div>
  );
}
