import { css } from '@/styled-system/css';
import { CoffeeEvent } from '@/types';

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
  return (
    <div className={modalOverlay} onClick={handleCloseModal}>
      <div className={modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={modalTitle}>選擇要查看的偶像</h3>
        {event.artists?.map((artist) => (
          <button
            key={artist.id}
            onClick={() => handleArtistSelect(artist.id)}
            className={artistOption}
          >
            <div
              className={artistAvatar}
              style={{
                backgroundImage: `url(${artist.profileImage})`,
              }}
            />
            <span className={artistName}>{artist.name || 'Unknown Artist'}</span>
          </button>
        ))}
        <button onClick={handleCloseModal} className={cancelButton}>
          取消
        </button>
      </div>
    </div>
  );
};

export default ArtistModal;
