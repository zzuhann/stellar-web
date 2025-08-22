'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
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

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) =>
    props.variant === 'primary'
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

const groupNameSchema = z.object({
  groupName: z.string().max(50, '團名不能超過50個字元').optional().or(z.literal('')),
});

type GroupNameFormData = z.infer<typeof groupNameSchema>;

interface GroupNameModalProps {
  isOpen: boolean;
  artistName: string;
  currentGroupName?: string;
  onConfirm: (groupName?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GroupNameModal({
  isOpen,
  artistName,
  currentGroupName,
  onConfirm,
  onCancel,
  isLoading = false,
}: GroupNameModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupNameFormData>({
    resolver: zodResolver(groupNameSchema),
    defaultValues: {
      groupName: currentGroupName || '',
    },
  });

  const onSubmit = (data: GroupNameFormData) => {
    onConfirm(data.groupName || undefined);
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSkip = () => {
    onConfirm(undefined);
    reset();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>設定團名</ModalTitle>
          <ModalDescription>
            審核通過藝人「{artistName}」，是否要設定團名？可以之後再補充。
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="groupName">團名</Label>
            <Input
              id="groupName"
              type="text"
              placeholder="例：BOYNEXTDOOR、SEVENTEEN、&TEAM"
              {...register('groupName')}
              disabled={isLoading}
            />
            {errors.groupName && <ErrorText>{errors.groupName.message}</ErrorText>}
          </FormGroup>

          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={handleSkip} disabled={isLoading}>
              略過
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? '設定中...' : '確認設定'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}
