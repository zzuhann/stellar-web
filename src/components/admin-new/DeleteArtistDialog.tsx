'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { adminApi } from '@/lib/api';
import ModalOverlay from '@/components/ui/ModalOverlay';
import type { Artist } from '@/types';

const dialogBox = css({
  background: 'white',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  maxWidth: '420px',
  width: '100%',
  overflow: 'hidden',
});

const dialogHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: '5',
  paddingTop: '5',
  paddingBottom: '3',
});

const dialogTitle = css({
  textStyle: 'h4',
  color: 'color.text.primary',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const dialogCloseBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '1',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
});

const dialogBody = css({
  paddingX: '5',
  paddingBottom: '3',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const dialogFooter = css({
  display: 'flex',
  gap: '2',
  paddingX: '5',
  paddingBottom: '5',
  paddingTop: '2',
});

const dialogBtn = cva({
  base: {
    flex: 1,
    paddingY: '2.5',
    paddingX: '4',
    borderRadius: 'radius.md',
    border: '1px solid',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    transition: 'background 0.15s ease',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      cancel: {
        background: 'white',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': { background: 'color.background.secondary' },
      },
      destructive: {
        background: 'red.600',
        borderColor: 'red.600',
        color: 'white',
        '&:hover:not(:disabled)': { background: 'red.700', borderColor: 'red.700' },
      },
      close: {
        background: 'white',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover:not(:disabled)': { background: 'color.background.secondary' },
      },
    },
  },
});

const spinner = css({
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTopColor: 'white',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
});

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

  const isError = errorMessage !== null;
  const isLoading = deleteMutation.isPending;

  function handleClose() {
    if (!isLoading) {
      setErrorMessage(null);
      deleteMutation.reset();
      onClose();
    }
  }

  if (!artist) return null;

  return (
    <ModalOverlay isOpen zIndex={50} padding="16px">
      <div
        className={dialogBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className={dialogHeader}>
          <h3 id="delete-dialog-title" className={dialogTitle}>
            <ExclamationTriangleIcon
              className={css({ width: '20px', height: '20px', color: 'amber.500' })}
              aria-hidden="true"
            />
            {isError ? '刪除失敗' : '確認刪除'}
          </h3>
          <button className={dialogCloseBtn} onClick={handleClose} aria-label="關閉" type="button">
            <XMarkIcon width={20} height={20} aria-hidden="true" />
          </button>
        </div>
        <div className={dialogBody}>
          {isError ? (
            <p>{errorMessage}</p>
          ) : (
            <p>確定刪除藝人「{artist.stageName}」？此操作無法復原。</p>
          )}
        </div>
        <div className={dialogFooter}>
          {isError ? (
            <button className={dialogBtn({ variant: 'close' })} onClick={handleClose} type="button">
              關閉
            </button>
          ) : (
            <>
              <button
                className={dialogBtn({ variant: 'cancel' })}
                onClick={handleClose}
                disabled={isLoading}
                type="button"
              >
                取消
              </button>
              <button
                className={dialogBtn({ variant: 'destructive' })}
                onClick={() => deleteMutation.mutate(artist.id)}
                disabled={isLoading}
                type="button"
              >
                {isLoading && <div className={spinner} aria-hidden="true" />}
                確認刪除
              </button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
