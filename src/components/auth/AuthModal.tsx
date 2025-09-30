'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import { useScrollLock } from '@/hooks/useScrollLock';
import SignInForm from './SignInForm';
import ModalOverlayWithTransition from '../ui/ModalOverlayWithTransition';
import { css, cva } from '@/styled-system/css';

const modalContent = cva({
  base: {
    background: 'color.background.primary',
    width: '100%',
    maxWidth: '480px',
    borderRadius: 'radius.lg',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 16px',
    transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  },
  variants: {
    isOpen: {
      true: {
        transform: 'scale(1) translateY(0)',
      },
      false: {
        transform: 'scale(0.95) translateY(-20px)',
      },
    },
  },
});

const modalHeader = css({
  padding: '20px 20px 0',
  display: 'flex',
  justifyContent: 'flex-end',
  flexShrink: '0',
});

const closeButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
});

const contentContainer = css({
  flex: 1,
  padding: '0 20px 20px',
  overflowY: 'auto',
  minHeight: 0,
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { redirectUrl } = useAuth();

  useScrollLock(isOpen);

  const handleSuccess = () => {
    onClose();

    if (redirectUrl) {
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    }
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
  }, [isOpen]);

  return (
    <ModalOverlayWithTransition isOpen={isOpen} onClick={handleClose}>
      <div className={modalContent({ isOpen })} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeader}>
          <button className={closeButton} onClick={handleClose}>
            <XMarkIcon width={20} height={20} />
          </button>
        </div>

        <div className={contentContainer}>
          <SignInForm onSuccess={handleSuccess} />
        </div>
      </div>
    </ModalOverlayWithTransition>
  );
}
