'use client';

import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';

const button = css({
  paddingY: '2.5',
  paddingX: '10',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  fontWeight: 'semibold',
  transition: 'background 0.2s ease, transform 0.2s ease',
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

  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

export default function BackToHomeButton() {
  const router = useRouter();

  return (
    <button className={button} onClick={() => router.push('/')} type="button">
      回首頁
      <br />
      看更多藝人
    </button>
  );
}
