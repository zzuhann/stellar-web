'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { venueApi, handleApiError } from '@/lib/api';
import { useAuthToken } from '@/hooks/useAuthToken';
import queryKey from '@/hooks/queryKey';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import VenueForm, { type VenueFormValues } from '@/components/admin-new/VenueForm';
import type { UpdateVenueData } from '@/types';

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

const fieldGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5',
});

const formErrorBanner = css({
  paddingX: '4',
  paddingY: '3',
  borderRadius: 'radius.md',
  background: 'red.50',
  border: '1px solid',
  borderColor: 'red.200',
  textStyle: 'bodySmall',
  color: 'red.700',
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const venueId = params.id;
  const { token } = useAuthToken();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusOverride, setStatusOverride] = useState<string | null>(null);

  // ─── Load data ─────────────────────────────────────────────────────────────

  const {
    data: venue,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKey.venueDetail(venueId),
    queryFn: () => venueApi.getAdminVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Update mutation ───────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVenueData) => venueApi.updateVenue(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
      router.push('/admin-new/venues');
    },
    onError: (err) => {
      setSubmitError(handleApiError(err));
    },
  });

  // ─── Delete mutation ───────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: () => venueApi.permanentDeleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      router.push('/admin-new/venues');
    },
    onError: (err) => {
      setDeleteError(handleApiError(err));
    },
  });

  // ─── Status toggle mutation ────────────────────────────────────────────────

  const statusMutation = useMutation({
    mutationFn: (status: 'active' | 'inactive') => venueApi.updateVenue(venueId, { status }),
    onSuccess: (_, status) => {
      setStatusOverride(status);
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
    },
    onError: (err) => {
      setSubmitError(handleApiError(err));
    },
  });

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={pageWrapper}>
        <div className={container}>
          <Skeleton width="120px" height="16px" />
          <div className={css({ marginTop: '5' })}>
            <Skeleton width="200px" height="28px" />
          </div>
          <div
            className={css({ marginTop: '6', display: 'flex', flexDirection: 'column', gap: '5' })}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={fieldGroup}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="100%" height="40px" borderRadius="8px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className={pageWrapper}>
        <div className={container}>
          <Link href="/admin-new/venues" className={backLink}>
            <ChevronLeftIcon aria-hidden="true" />
            返回場地列表
          </Link>
          <div className={formErrorBanner} role="alert">
            載入場地資料失敗，請返回重試。
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusOverride ?? venue.status;
  const canDelete = venue.status === 'inactive' && venue.eventCount === 0;

  const initialValues: VenueFormValues = {
    name: venue.name,
    address: venue.address,
    region: venue.region,
    nearestMrt: venue.nearestMrt ?? '',
    mrtWalkMinutes: venue.mrtWalkMinutes != null ? String(venue.mrtWalkMinutes) : '',
    capacityRange: venue.capacityRange ?? '',
    description: venue.description ?? '',
    coverPhoto: venue.coverPhoto ?? '',
    otherPhotos: venue.otherPhotos ?? [],
    hostTags: venue.hostTags ?? [],
    threads: venue.socialMedia?.threads ?? '',
    instagram: venue.socialMedia?.instagram ?? '',
    line: venue.socialMedia?.line ?? '',
    preferredContact: (venue.preferredContact as VenueFormValues['preferredContact']) ?? '',
    contactUrl: venue.contactUrl ?? '',
  };

  return (
    <div className={pageWrapper}>
      <div className={container}>
        <Link href="/admin-new/venues" className={backLink}>
          <ChevronLeftIcon aria-hidden="true" />
          返回場地列表
        </Link>
        <h1 className={pageTitle}>編輯場地</h1>
        <VenueForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={(data) => {
            setSubmitError(null);
            updateMutation.mutate(data);
          }}
          isSubmitting={updateMutation.isPending}
          submitError={submitError}
          authToken={token || undefined}
          status={currentStatus}
          onStatusChange={(status) => statusMutation.mutate(status)}
          isStatusChanging={statusMutation.isPending}
          onDeleteClick={() => {
            setDeleteError(null);
            setDeleteDialogOpen(true);
          }}
          canDelete={canDelete}
        />
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="確認永久刪除場地？"
        description="此操作無法復原。場地資料將從系統中完全移除。若該場地有關聯的活動紀錄，系統將拒絕刪除。"
        confirmLabel="永久刪除"
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
        isLoading={deleteMutation.isPending}
        error={deleteError}
      />
    </div>
  );
}
