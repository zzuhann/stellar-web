'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { useAuthToken } from '@/hooks/useAuthToken';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import VenueForm, { type VenueFormValues } from '@/components/admin-new/VenueForm';
import { useAdminVenueDetail } from '@/components/admin-new/hooks/useAdminVenueDetail';
import { useUpdateVenueMutation } from '@/components/admin-new/hooks/useUpdateVenueMutation';
import { useDeleteVenueMutation } from '@/components/admin-new/hooks/useDeleteVenueMutation';
import { useVenueStatusMutation } from '@/components/admin-new/hooks/useVenueStatusMutation';

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
  const params = useParams<{ id: string }>();
  const venueId = params.id;
  const { token } = useAuthToken();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ─── Data & mutations ──────────────────────────────────────────────────────

  const { data: venue, isLoading, isError } = useAdminVenueDetail(venueId);
  const updateMutation = useUpdateVenueMutation(venueId, { onError: (msg) => setSubmitError(msg) });
  const deleteMutation = useDeleteVenueMutation(venueId, { onError: (msg) => setDeleteError(msg) });
  const { mutation: statusMutation, statusOverride } = useVenueStatusMutation(venueId, {
    onError: (msg) => setSubmitError(msg),
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
  const canDelete = currentStatus === 'inactive' && venue.eventCount === 0;

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
