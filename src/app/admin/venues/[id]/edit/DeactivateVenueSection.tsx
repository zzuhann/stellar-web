'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import { showToast } from '@/lib/toast';

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
  currentStatus: 'active' | 'inactive';
};

export default function DeactivateVenueSection({ venueId, currentStatus }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const deactivateMutation = useMutation({
    mutationFn: () => venueApi.updateVenue(venueId, { status: 'inactive' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue-detail', venueId] });
      showToast.success('場地已下架');
      router.push('/admin/venues');
    },
    onError: () => {
      showToast.error('下架失敗，請再試一次');
    },
  });

  // Already inactive — no need to show this section
  if (currentStatus === 'inactive') return null;

  return (
    <div className={section}>
      <div className={dangerZone}>
        <p className={dangerTitle}>危險操作</p>
        <button
          type="button"
          className={deactivateBtn}
          onClick={() => setShowConfirm(true)}
          disabled={deactivateMutation.isPending}
        >
          下架場地
        </button>
      </div>

      {showConfirm && (
        <div className={dialogOverlay} onClick={() => setShowConfirm(false)}>
          <div className={dialogBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={dialogTitle}>確認下架場地？</h2>
            <p className={dialogDesc}>下架後，場地將不再顯示於公開頁面。你可以隨時重新上架。</p>
            <div className={dialogActions}>
              <button type="button" className={cancelBtn} onClick={() => setShowConfirm(false)}>
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
    </div>
  );
}
