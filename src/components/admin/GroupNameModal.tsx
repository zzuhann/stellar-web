'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
`;

const ModalDescription = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin: 4px 0 0 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: #3a5d7a;
      border-color: #3a5d7a;
    }
    
    &:disabled {
      background: var(--color-text-disabled);
      border-color: var(--color-text-disabled);
      cursor: not-allowed;
    }
  `
      : `
    background: var(--color-bg-primary);
    border-color: var(--color-border-light);
    color: var(--color-text-primary);
    
    &:hover {
      background: var(--color-bg-secondary);
      border-color: var(--color-border-medium);
    }
  `}
`;

const GroupItemContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #dc2626;
  background: transparent;

  &:hover {
    background: #dc2626;
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  margin-top: 8px;

  &:hover {
    background: var(--color-border-light);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

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
    <ModalOverlay $isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>設定團名</ModalTitle>
          <ModalDescription>
            審核通過藝人「{artistName}」，是否要設定團名？可以之後再補充。
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>團名</Label>
            {groupNames.length === 0 && (
              <AddButton type="button" onClick={addGroupName} disabled={isLoading}>
                <PlusIcon />
                新增團名
              </AddButton>
            )}
            {groupNames.map((groupName, index) => (
              <GroupItemContainer key={index}>
                <Input
                  type="text"
                  placeholder="例：BOYNEXTDOOR、SEVENTEEN、&TEAM"
                  value={groupName}
                  onChange={(e) => updateGroupName(index, e.target.value)}
                  disabled={isLoading}
                />
                <RemoveButton
                  type="button"
                  onClick={() => removeGroupName(index)}
                  disabled={isLoading}
                >
                  <XMarkIcon />
                </RemoveButton>
              </GroupItemContainer>
            ))}
            {groupNames.length > 0 && (
              <AddButton type="button" onClick={addGroupName} disabled={isLoading}>
                <PlusIcon />
                新增更多團名
              </AddButton>
            )}
            {errors.groupNames && <ErrorText>{errors.groupNames.message}</ErrorText>}
          </FormGroup>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={handleSkip} disabled={isLoading}>
              略過
            </Button>
            <Button type="button" $variant="secondary" onClick={handleCancel} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? '設定中...' : '確認設定'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}
