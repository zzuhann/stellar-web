import React from 'react';
import styled from 'styled-components';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useScrollLock } from '@/hooks/useScrollLock';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
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
  padding: 20px;
`;

const ModalMessage = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 20px 20px 20px;
`;

const Button = styled.button<{ $variant: 'cancel' | 'confirm' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) => {
    if (props.$variant === 'cancel') {
      return `
        background: var(--color-bg-primary);
        border-color: var(--color-border-light);
        color: var(--color-text-primary);
        
        &:hover {
          background: var(--color-bg-secondary);
          border-color: var(--color-border-medium);
        }
      `;
    } else {
      return `
        background: #dc2626;
        border-color: #dc2626;
        color: white;
        
        &:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '確認',
  cancelText = '取消',
  isLoading = false,
}: ConfirmModalProps) {
  // 使用 scroll lock hook
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#eab308' }} />
            {title}
          </ModalTitle>
          <CloseButton onClick={onCancel}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <ModalMessage>{message}</ModalMessage>
        </ModalBody>
        <ModalFooter>
          <Button $variant="cancel" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button $variant="confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '處理中...' : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}
