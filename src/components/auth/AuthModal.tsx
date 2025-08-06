'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { useAuth } from '@/lib/auth-context';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ResetPasswordForm from './ResetPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease-out,
    visibility 0.3s ease-out;

  @media (min-width: 768px) {
    align-items: center;
  }
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
  background: var(--color-bg-primary);
  width: 100%;
  max-width: 480px;
  height: 85vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);

  @media (min-width: 768px) {
    border-radius: 16px;
    margin: 0 16px;
    min-height: auto;
    max-height: 80vh;
    transform: ${(props) =>
      props.isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)'};
    transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
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

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const router = useRouter();
  const { redirectUrl } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);

  const handleSuccess = () => {
    onClose();
    setMode('signin'); // 重置到登入模式

    // 如果有重定向 URL，等待一小段時間後跳轉
    if (redirectUrl) {
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    }
  };

  const handleClose = () => {
    onClose();
    // 延遲重置模式，避免視覺上的閃爍
    setTimeout(() => setMode('signin'), 300);
  };

  // 關閉 modal 時重置模式
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setMode('signin'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 阻止背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleClose}>
      <ModalContent isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={handleClose}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

        <ContentContainer>
          {mode === 'signin' && (
            <SignInForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setMode('signup')}
              onSwitchToReset={() => setMode('reset')}
            />
          )}

          {mode === 'signup' && (
            <SignUpForm onSuccess={handleSuccess} onSwitchToSignIn={() => setMode('signin')} />
          )}

          {mode === 'reset' && (
            <ResetPasswordForm
              onSuccess={() => setMode('signin')}
              onSwitchToSignIn={() => setMode('signin')}
            />
          )}
        </ContentContainer>
      </ModalContent>
    </ModalOverlay>
  );
}
