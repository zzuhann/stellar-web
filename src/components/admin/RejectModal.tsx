'use client';

import { useState, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';

interface RejectModalProps {
  isOpen: boolean;
  title: string;
  itemName: string; // 藝人名稱或活動標題
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading?: boolean;
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
`;

const ModalContainer = styled.div`
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 4px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ItemInfo = styled.div`
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
`;

const ItemLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 4px;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
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

const RequiredIndicator = styled.span`
  color: #dc2626;
  margin-left: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  &:disabled {
    background: var(--color-bg-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }
`;

const HelperText = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 6px;
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: #dc2626;
  margin-top: 6px;
`;

const CharacterCount = styled.div<{ isNearLimit: boolean }>`
  font-size: 11px;
  color: ${(props) => (props.isNearLimit ? '#dc2626' : 'var(--color-text-secondary)')};
  text-align: right;
  margin-top: 4px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--color-border-light);
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: #dc2626;
    border-color: #dc2626;
    color: white;
    
    &:hover:not(:disabled) {
      background: #b91c1c;
      border-color: #b91c1c;
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

    &:hover:not(:disabled) {
      background: var(--color-bg-secondary);
      border-color: var(--color-border-medium);
    }
  `}
`;

const LoadingSpinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const MAX_REASON_LENGTH = 500;

export default function RejectModal({
  isOpen,
  title,
  itemName,
  onConfirm,
  onClose,
  loading = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (!reason.trim()) {
      setError('請填寫拒絕原因');
      return;
    }

    if (reason.length > MAX_REASON_LENGTH) {
      setError(`拒絕原因不能超過 ${MAX_REASON_LENGTH} 字元`);
      return;
    }

    onConfirm(reason.trim());
  }, [reason, onConfirm]);

  const handleReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    if (!loading) {
      setReason('');
      setError('');
      onClose();
    }
  }, [loading, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  if (!isOpen) return null;

  const isNearLimit = reason.length > MAX_REASON_LENGTH * 0.8;
  const isOverLimit = reason.length > MAX_REASON_LENGTH;

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={handleClose} disabled={loading}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <ItemInfo>
            <ItemLabel>項目</ItemLabel>
            <ItemName>{itemName}</ItemName>
          </ItemInfo>

          <FormGroup>
            <Label>
              拒絕原因
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Textarea
              value={reason}
              onChange={handleReasonChange}
              placeholder="請說明拒絕的原因，幫助投稿者了解如何改進..."
              disabled={loading}
            />
            <CharacterCount isNearLimit={isNearLimit}>
              {reason.length}/{MAX_REASON_LENGTH}
            </CharacterCount>
            {error && <ErrorText>{error}</ErrorText>}
            {!error && (
              <HelperText>請清楚說明拒絕原因，幫助投稿者改進內容以符合平台規範。</HelperText>
            )}
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !reason.trim() || isOverLimit}
          >
            {loading && <LoadingSpinner />}
            確認拒絕
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
}
