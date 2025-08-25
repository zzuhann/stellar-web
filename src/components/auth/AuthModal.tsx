'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { useAuth } from '@/lib/auth-context';
import { useScrollLock } from '@/hooks/useScrollLock';
import SignInForm from './SignInForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

// Styled Components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease-out,
    visibility 0.3s ease-out;
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: var(--color-bg-primary);
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 16px;
  transform: ${(props) =>
    props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)'};
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
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

const ContentContainer = styled.div`
  flex: 1;
  padding: 0 20px 20px;
  overflow-y: auto;
  min-height: 0;
`;

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { redirectUrl } = useAuth();

  // 使用 scroll lock hook
  useScrollLock(isOpen);

  const handleSuccess = () => {
    onClose();

    // 如果有重定向 URL，等待一小段時間後跳轉
    if (redirectUrl) {
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // 關閉 modal 時重置模式
  useEffect(() => {
    if (!isOpen) {
      return;
    }
  }, [isOpen]);

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={handleClose}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

        <ContentContainer>
          <SignInForm onSuccess={handleSuccess} />
        </ContentContainer>
      </ModalContent>
    </ModalOverlay>
  );
}
