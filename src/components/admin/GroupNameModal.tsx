'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import ModalOverlay from '../ui/ModalOverlay';

const modalContent = css({
  background: 'color.background.primary',
  borderRadius: 'radius.lg',
  padding: '24px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: 'shadow.lg',
});

const modalHeader = css({
  marginBottom: '20px',
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 8px 0',
});

const modalDescription = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.5',
});

const formGroup = css({
  marginBottom: '20px',
});

const label = css({
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
  marginBottom: '8px',
});

const input = css({
  width: '100%',
  padding: '12px 16px',
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
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
});

const errorText = css({
  fontSize: '12px',
  color: '#ef4444',
  margin: '4px 0 0 0',
});

const buttonGroup = css({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
});

const button = cva({
  base: {
    padding: '10px 20px',
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
          background: '#3a5d7a',
          borderColor: '#3a5d7a',
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
});

const groupItemContainer = css({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '8px',
});

const removeButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: 'radius.md',
  color: '#dc2626',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid',
  borderColor: 'color.status.error',
  background: 'transparent',
  '&:hover': {
    background: '#dc2626',
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
  gap: '8px',
  padding: '8px 12px',
  borderRadius: 'radius.md',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.secondary',
  color: 'color.text.primary',
  marginTop: '8px',
  '&:hover': {
    background: 'color.border.light',
  },
  '& svg': {
    width: '16px',
    height: '16px',
  },
});

const groupNameSchema = z.object({
  groupNames: z.array(z.string().min(1, '團名不能為空').max(50, '團名不能超過50個字元')).optional(),
});

type GroupNameFormData = z.infer<typeof groupNameSchema>;

interface GroupNameModalProps {
  isOpen: boolean;
  artistName: string;
  currentGroupNames?: string[];
  onConfirm: (groupNames?: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GroupNameModal({
  isOpen,
  artistName,
  currentGroupNames,
  onConfirm,
  onCancel,
  isLoading = false,
}: GroupNameModalProps) {
  const [groupNames, setGroupNames] = useState<string[]>(currentGroupNames || []);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<GroupNameFormData>({
    resolver: zodResolver(groupNameSchema),
    defaultValues: {
      groupNames: currentGroupNames || [],
    },
  });

  const addGroupName = () => {
    const newGroupNames = [...groupNames, ''];
    setGroupNames(newGroupNames);
    setValue('groupNames', newGroupNames);
  };

  const removeGroupName = (index: number) => {
    const newGroupNames = groupNames.filter((_, i) => i !== index);
    setGroupNames(newGroupNames);
    setValue('groupNames', newGroupNames);
  };

  const updateGroupName = (index: number, value: string) => {
    const newGroupNames = [...groupNames];
    newGroupNames[index] = value;
    setGroupNames(newGroupNames);
    setValue('groupNames', newGroupNames);
  };

  const onSubmit = (data: GroupNameFormData) => {
    const filteredNames = data.groupNames?.filter((name) => name.trim() !== '') || [];
    onConfirm(filteredNames.length > 0 ? filteredNames : undefined);
    reset();
    setGroupNames([]);
  };

  const handleCancel = () => {
    reset();
    setGroupNames([]);
    onCancel();
  };

  const handleSkip = () => {
    onConfirm(undefined);
    reset();
    setGroupNames([]);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen}>
      <div className={modalContent}>
        <div className={modalHeader}>
          <h3 className={modalTitle}>設定團名</h3>
          <p className={modalDescription}>
            審核通過藝人「{artistName}」，是否要設定團名？可以之後再補充。
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={formGroup}>
            <label className={label}>團名</label>
            {groupNames.length === 0 && (
              <button
                type="button"
                className={addButton}
                onClick={addGroupName}
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
                  onChange={(e) => updateGroupName(index, e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={removeButton}
                  onClick={() => removeGroupName(index)}
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
                onClick={addGroupName}
                disabled={isLoading}
              >
                <PlusIcon />
                新增更多團名
              </button>
            )}
            {errors.groupNames && <p className={errorText}>{errors.groupNames.message}</p>}
          </div>

          <div className={buttonGroup}>
            <button
              type="button"
              className={button({ variant: 'secondary' })}
              onClick={handleSkip}
              disabled={isLoading}
            >
              略過
            </button>
            <button
              type="button"
              className={button({ variant: 'secondary' })}
              onClick={handleCancel}
              disabled={isLoading}
            >
              取消
            </button>
            <button type="submit" className={button({ variant: 'primary' })} disabled={isLoading}>
              {isLoading ? '設定中...' : '確認設定'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
