'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import queryKey from '@/hooks/queryKey';
import type { VenueEventCard } from '@/types';

const section = css({
  maxWidth: '640px',
  margin: '0 auto',
  paddingX: '4',
  paddingBottom: '16',
});

const dangerZone = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '6',
  marginTop: '2',
});

const dangerTitle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.secondary',
  marginBottom: '3',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

const deactivateBtn = css({
  paddingY: '2.5',
  paddingX: '5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'red.300',
  background: 'white',
  color: 'red.600',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover:not(:disabled)': {
    background: 'red.50',
    borderColor: 'red.400',
  },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

const dialogOverlay = css({
  position: 'fixed',
  inset: '0',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'alpha.black.50',
  padding: '4',
});

const dialogBox = css({
  background: 'color.background.primary',
  borderRadius: 'radius.lg',
  width: '100%',
  maxWidth: '400px',
  padding: '6',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

const dialogTitle = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  margin: 0,
});

const dialogDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: 0,
});

const dialogActions = css({
  display: 'flex',
  gap: '3',
  justifyContent: 'flex-end',
  marginTop: '2',
});

const cancelBtn = css({
  paddingY: '2.5',
  paddingX: '5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:hover': { background: 'gray.50' },
});

const confirmBtn = css({
  paddingY: '2.5',
  paddingX: '5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'red.500',
  background: 'red.500',
  color: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover:not(:disabled)': {
    background: 'red.600',
    borderColor: 'red.600',
  },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

type Props = {
  venueId: string;
  currentStatus: 'active' | 'inactive' | 'pending' | 'rejected';
  events: VenueEventCard[];
};

export default function DeactivateVenueSection({ venueId, currentStatus, events }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deactivateMutation = useMutation({
    mutationFn: () => venueApi.updateVenue(venueId, { status: 'inactive' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
      showToast.success('場地已下架');
      router.push('/admin/venues');
    },
    onError: () => {
      showToast.error('下架失敗，請再試一次');
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: () => venueApi.permanentDeleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      showToast.success('場地已永久刪除');
      router.push('/admin/venues');
    },
    onError: () => {
      showToast.error('刪除失敗，請再試一次');
    },
  });

  const canPermanentDelete = currentStatus === 'inactive' && events.length === 0;

  return (
    <div className={section}>
      <div className={dangerZone}>
        <p className={dangerTitle}>危險操作</p>

        {currentStatus === 'active' && (
          <button
            type="button"
            className={deactivateBtn}
            onClick={() => setShowDeactivateConfirm(true)}
            disabled={deactivateMutation.isPending}
          >
            下架場地
          </button>
        )}

        {canPermanentDelete && (
          <button
            type="button"
            className={deactivateBtn}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={permanentDeleteMutation.isPending}
          >
            永久刪除場地
          </button>
        )}
      </div>

      {showDeactivateConfirm && (
        <div className={dialogOverlay} onClick={() => setShowDeactivateConfirm(false)}>
          <div className={dialogBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={dialogTitle}>確認下架場地？</h2>
            <p className={dialogDesc}>下架後，場地將不再顯示於公開頁面。你可以隨時重新上架。</p>
            <div className={dialogActions}>
              <button
                type="button"
                className={cancelBtn}
                onClick={() => setShowDeactivateConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className={confirmBtn}
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending ? '下架中...' : '確認下架'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className={dialogOverlay}
          onClick={() => !permanentDeleteMutation.isPending && setShowDeleteConfirm(false)}
        >
          <div className={dialogBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={dialogTitle}>永久刪除場地？</h2>
            <p className={dialogDesc}>此操作無法復原，場地資料將被永久刪除。確定要繼續嗎？</p>
            <div className={dialogActions}>
              <button
                type="button"
                className={cancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={permanentDeleteMutation.isPending}
              >
                取消
              </button>
              <button
                type="button"
                className={confirmBtn}
                onClick={() => permanentDeleteMutation.mutate()}
                disabled={permanentDeleteMutation.isPending}
              >
                {permanentDeleteMutation.isPending ? '刪除中...' : '永久刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
