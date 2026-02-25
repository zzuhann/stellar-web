import { css } from '@/styled-system/css';
import { CoffeeEvent } from '@/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';

const modalOverlay = css({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '1000',
});

const modalContent = css({
  background: 'white',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  margin: '20px',
  maxWidth: '400px',
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 16px 0',
  textAlign: 'center',
});

const artistOption = css({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'var(--radius-md)',
  background: 'white',
  cursor: 'pointer',
  marginBottom: '8px',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: 'color.background.secondary',
    borderColor: 'color.border.medium',
  },

  '&:last-child': {
    marginBottom: '0',
  },
});

const cancelButton = css({
  width: '100%',
  padding: '12px',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'var(--radius-md)',
  background: 'white',
  color: 'color.text.secondary',
  cursor: 'pointer',
  marginTop: '16px',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: 'color.background.secondary',
  },
});

const artistAvatar = css({
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'color.background.secondary',
  flexShrink: '0',
});

const artistName = css({
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
});

type ArtistModalProps = {
  event: CoffeeEvent;
  handleArtistSelect: (artistId: string) => void;
  handleCloseModal: () => void;
};

const ArtistModal = ({ event, handleArtistSelect, handleCloseModal }: ArtistModalProps) => {
  // 使用 focus trap 和 scroll lock
  const focusTrapRef = useFocusTrap<HTMLDivElement>(true);
  useScrollLock(true);

  return (
    <div
      className={modalOverlay}
      onClick={handleCloseModal}
      aria-label="點擊關閉"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCloseModal();
        }
      }}
    >
      <div
        ref={focusTrapRef}
        className={modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-modal-title"
      >
        <h3 id="artist-modal-title" className={modalTitle}>
          選擇要查看的偶像
        </h3>
        {event.artists?.map((artist) => (
          <button
            key={artist.id}
            type="button"
            onClick={() => handleArtistSelect(artist.id)}
            className={artistOption}
            aria-label={`選擇 ${artist.name || 'Unknown Artist'}`}
          >
            <div
              className={artistAvatar}
              style={{
                backgroundImage: `url(${artist.profileImage})`,
              }}
              role="img"
              aria-label={`${artist.name || 'Unknown Artist'} 的頭貼`}
            />
            <span className={artistName}>{artist.name || 'Unknown Artist'}</span>
          </button>
        ))}
        <button onClick={handleCloseModal} className={cancelButton} type="button">
          取消
        </button>
      </div>
    </div>
  );
};

export default ArtistModal;
