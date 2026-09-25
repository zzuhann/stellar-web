import { useMutation, useQueryClient } from '@tanstack/react-query';
import { venueApi, handleApiError } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import { showToast } from '@/lib/toast';
import queryKey from '@/hooks/queryKey';
import type { VenueBatchAction } from '@/components/admin-new/VenueBatchActionBar';

export function useVenueBatchMutation(
  selectedIds: Set<string>,
  options?: { onError?: (msg: string) => void }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: VenueBatchAction) => {
      const ids = Array.from(selectedIds);
      if (action === 'approve') {
        return venueApi.batchReviewVenues(ids.map((venueId) => ({ venueId, status: 'active' })));
      }
      if (action === 'reject') {
        return venueApi.batchReviewVenues(ids.map((venueId) => ({ venueId, status: 'rejected' })));
      }
      if (action === 'online') {
        return venueApi.batchStatusVenues(ids.map((venueId) => ({ venueId, status: 'active' })));
      }
      if (action === 'offline') {
        return venueApi.batchStatusVenues(ids.map((venueId) => ({ venueId, status: 'inactive' })));
      }
    },
    onSuccess: (_data, variables) => {
      const ids = Array.from(selectedIds);
      const count = ids.length;
      if (variables === 'approve') showToast.success(`已審核通過 ${count} 間場地`);
      else if (variables === 'reject') showToast.success(`已拒絕 ${count} 間場地`);
      else if (variables === 'online') showToast.success(`已上架 ${count} 間場地`);
      else if (variables === 'offline') showToast.success(`已下架 ${count} 間場地`);
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      // 批次動作會影響每個被選場地自己的詳情頁，不只場地列表
      revalidatePaths(['/venues', ...ids.map((venueId) => `/venues/${venueId}`)]);
    },
    onError: (err) => {
      options?.onError?.(handleApiError(err));
    },
  });
}
