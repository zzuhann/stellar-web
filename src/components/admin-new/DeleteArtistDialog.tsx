'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Artist } from '@/types';

interface DeleteArtistDialogProps {
  artist: Artist | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteArtistDialog({
  artist,
  onClose,
  onSuccess,
}: DeleteArtistDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteArtist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
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
      open={!!artist}
      title="確認刪除"
      description={artist ? `確定刪除藝人「${artist.stageName}」？此操作無法復原。` : ''}
      confirmLabel="確認刪除"
      onConfirm={() => {
        if (artist) deleteMutation.mutate(artist.id);
      }}
      onClose={handleClose}
      isLoading={deleteMutation.isPending}
      error={errorMessage}
    />
  );
}
