'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { CoffeeEvent } from '@/types';

interface DeleteEventDialogProps {
  event: CoffeeEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteEventDialog({ event, onClose, onSuccess }: DeleteEventDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      onSuccess();
    },
    onError: () => {
      setErrorMessage('刪除失敗，請稍後再試。');
    },
  });

  function handleClose() {
    if (!deleteMutation.isPending) {
      setErrorMessage(null);
      deleteMutation.reset();
      onClose();
    }
  }

  return (
    <ConfirmDialog
      open={!!event}
      title="確認刪除"
      description={
        event
          ? `確定刪除活動「${event.title}」？此操作無法復原，所有使用者的收藏記錄也將一併刪除。`
          : ''
      }
      confirmLabel="確認刪除"
      onConfirm={() => {
        if (event) deleteMutation.mutate(event.id);
      }}
      onClose={handleClose}
      isLoading={deleteMutation.isPending}
      error={errorMessage}
    />
  );
}
