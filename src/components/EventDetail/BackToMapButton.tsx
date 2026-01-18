'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import ArtistModal from './ArtistModal';
import { CoffeeEvent } from '@/types';

const ctaButton = css({
  padding: '10px 40px',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: '32px',
  marginBottom: '20px',

  '&:hover': {
    background: '#3a5d7a',
    borderColor: '#3a5d7a',
    transform: 'translateX(-50%) translateY(-1px)',
  },

  '&:active': {
    transform: 'translateX(-50%) translateY(0)',
  },
});

interface BackToMapButtonProps {
  event: CoffeeEvent;
}

export default function BackToMapButton({ event }: BackToMapButtonProps) {
  const router = useRouter();
  const [showArtistModal, setShowArtistModal] = useState(false);

  const handleBackToMap = () => {
    if (!event?.artists || event.artists.length === 0) {
      return;
    }

    if (event.artists.length === 1) {
      // 只有一個藝人，直接跳轉
      router.push(`/map/${event.artists[0].id}`);
    } else {
      // 多個藝人時需選擇藝人
      setShowArtistModal(true);
    }
  };

  const handleArtistSelect = (artistId: string) => {
    setShowArtistModal(false);
    router.push(`/map/${artistId}`);
  };

  const handleCloseModal = () => {
    setShowArtistModal(false);
  };

  return (
    <>
      <button className={ctaButton} onClick={handleBackToMap}>
        回地圖頁
        <br />
        看其他生日應援
      </button>

      {showArtistModal && (
        <ArtistModal
          event={event}
          handleArtistSelect={handleArtistSelect}
          handleCloseModal={handleCloseModal}
        />
      )}
    </>
  );
}
