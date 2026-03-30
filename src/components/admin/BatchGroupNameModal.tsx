'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { Artist } from '@/types';
import ModalOverlay from '../ui/ModalOverlay';

const modalContent = css({
  background: 'color.background.primary',
  borderRadius: 'radius.lg',
  padding: '6',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: 'shadow.lg',
});

const modalHeader = css({
  marginBottom: '5',
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  marginTop: '0',
  marginX: '0',
  marginBottom: '2',
});

const modalDescription = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: 1.5,
});

const artistSection = css({
  marginBottom: '6',
  padding: '4',
  background: 'color.background.secondary',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
});

const artistName = css({
  fontSize: '16px',
  fontWeight: '600',
  color: 'color.text.primary',
  marginTop: '0',
  marginX: '0',
  marginBottom: '3',
});

const formGroup = css({
  marginBottom: '4',
});

const label = css({
  display: 'block',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  marginBottom: '2',
});

const input = css({
  width: '100%',
  paddingY: '3',
  paddingX: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
});

const buttonGroup = css({
  display: 'flex',
  gap: '3',
  justifyContent: 'flex-end',
  marginTop: '6',
  paddingTop: '5',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const button = cva({
  base: {
    paddingY: '2.5',
    paddingX: '5',
    borderRadius: 'radius.lg',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
  },
  variants: {
    variant: {
      primary: {
        background: 'color.primary',
        borderColor: 'color.primary',
        color: 'white',
        '&:hover:not(:disabled)': {
          background: 'stellarBlue.600',
          borderColor: 'stellarBlue.600',
        },
        '&:disabled': {
          background: 'color.text.disabled',
          borderColor: 'color.text.disabled',
          cursor: 'not-allowed',
        },
      },
      secondary: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'secondary',
  },
});

const groupItemContainer = css({
  display: 'flex',
  gap: '2',
  alignItems: 'center',
  marginBottom: '2',
});

const removeButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: 'radius.md',
  color: 'red.600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid red.600',
  background: 'transparent',
  '&:hover': {
    background: 'red.600',
    color: 'white',
  },
  '& svg': {
    width: '16px',
    height: '16px',
  },
});

const addButton = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.secondary',
  color: 'color.text.primary',
  marginTop: '2',
  '&:hover': {
    background: 'color.border.light',
  },
  '& svg': {
    width: '16px',
    height: '16px',
  },
});

interface ArtistGroupNames {
  [artistId: string]: string[];
}

interface BatchGroupNameModalProps {
  isOpen: boolean;
  artists: Artist[];
  onConfirm: (artistGroupNames: ArtistGroupNames) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BatchGroupNameModal({
  isOpen,
  artists,
  onConfirm,
  onCancel,
  isLoading = false,
}: BatchGroupNameModalProps) {
  // 初始化每個藝人的團名設定
  const [artistGroupNames, setArtistGroupNames] = useState<ArtistGroupNames>(() => {
    const initial: ArtistGroupNames = {};
    artists.forEach((artist) => {
      initial[artist.id] = artist.groupNames || [];
    });
    return initial;
  });

  const addGroupName = (artistId: string) => {
    setArtistGroupNames((prev) => ({
      ...prev,
      [artistId]: [...(prev[artistId] || []), ''],
    }));
  };

  const removeGroupName = (artistId: string, index: number) => {
    setArtistGroupNames((prev) => ({
      ...prev,
      [artistId]: (prev[artistId] || []).filter((_, i) => i !== index),
    }));
  };

  const updateGroupName = (artistId: string, index: number, value: string) => {
    setArtistGroupNames((prev) => {
      const currentNames = [...(prev[artistId] || [])];
      currentNames[index] = value;
      return {
        ...prev,
        [artistId]: currentNames,
      };
    });
  };

  const handleSubmit = () => {
    // 過濾掉空字串
    const filteredGroupNames: ArtistGroupNames = {};
    Object.entries(artistGroupNames).forEach(([artistId, groupNames]) => {
      filteredGroupNames[artistId] = groupNames.filter((name) => name.trim() !== '');
    });
    onConfirm(filteredGroupNames);
  };

  const handleCancel = () => {
    // 重置狀態
    const initial: ArtistGroupNames = {};
    artists.forEach((artist) => {
      initial[artist.id] = artist.groupNames || [];
    });
    setArtistGroupNames(initial);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen}>
      <div className={modalContent}>
        <div className={modalHeader}>
          <h2 className={modalTitle}>批次設定團名</h2>
          <p className={modalDescription}>
            為 {artists.length} 位選中的藝人設定團名，可以為每位藝人設定不同的團名。
          </p>
        </div>

        {artists.map((artist) => {
          const groupNames = artistGroupNames[artist.id] || [];
          return (
            <div key={artist.id} className={artistSection}>
              <h3 className={artistName}>{artist.stageNameZh || artist.stageName}</h3>
              <div className={formGroup}>
                <label className={label}>團名</label>
                {groupNames.length === 0 && (
                  <button
                    type="button"
                    className={addButton}
                    onClick={() => addGroupName(artist.id)}
                    disabled={isLoading}
                  >
                    <PlusIcon />
                    新增團名
                  </button>
                )}
                {groupNames.map((groupName, index) => (
                  <div key={index} className={groupItemContainer}>
                    <input
                      type="text"
                      className={input}
                      placeholder="例：BOYNEXTDOOR、SEVENTEEN、&TEAM"
                      value={groupName}
                      onChange={(e) => updateGroupName(artist.id, index, e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className={removeButton}
                      onClick={() => removeGroupName(artist.id, index)}
                      disabled={isLoading}
                    >
                      <XMarkIcon />
                    </button>
                  </div>
                ))}
                {groupNames.length > 0 && (
                  <button
                    type="button"
                    className={addButton}
                    onClick={() => addGroupName(artist.id)}
                    disabled={isLoading}
                  >
                    <PlusIcon />
                    新增更多團名
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className={buttonGroup}>
          <button
            type="button"
            className={button({ variant: 'secondary' })}
            onClick={handleCancel}
            disabled={isLoading}
          >
            取消
          </button>
          <button
            type="button"
            className={button({ variant: 'primary' })}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '設定中...' : '確認批次通過'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
