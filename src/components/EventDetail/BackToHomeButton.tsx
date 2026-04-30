'use client';

import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

const button = css({
  paddingY: '2.5',
  paddingX: '10',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  fontWeight: 'semibold',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'transparent',
  borderColor: 'color.primary',
  color: 'color.primary',

  '&:hover': {
    background: 'stellarBlue.50',
    transform: 'translateY(-1px)',
  },

  '&:active': {
    transform: 'translateY(0)',
  },
});

interface BackToHomeButtonProps {
  eventId: string;
}

export default function BackToHomeButton({ eventId }: BackToHomeButtonProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = () => {
    sendGAEvent('event', 'click_home', {
      event_page: '/event/[id]',
      user_id: user?.uid ?? '',
      content_id: eventId,
    });
    router.push('/');
  };

  return (
    <button className={button} onClick={handleClick} type="button">
      回首頁
      <br />
      看更多藝人
    </button>
  );
}
