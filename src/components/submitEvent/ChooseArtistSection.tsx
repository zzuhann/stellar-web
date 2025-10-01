import { ChevronDownIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { errorText, formGroup, helperText, label } from './styles';
import { Artist } from '@/types';
import { css } from '@/styled-system/css';
import Image from 'next/image';
import { EventSubmissionFormData } from '@/lib/validations';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

const artistSelectionButton = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'color.border.medium',
    background: 'color.background.secondary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '15px',
  },
});

const selectedArtistInfo = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '1',
  justifyContent: 'space-between',
});

const imageContainer = css({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  overflow: 'hidden',
  marginRight: '8px',
  position: 'relative',
});

const artistName = css({
  fontWeight: '500',
});

const placeholderText = css({
  color: 'color.text.secondary',
});

type ChooseArtistSectionProps = {
  mode: 'create' | 'edit';
  selectedArtists: Artist[];
  openArtistSelectionModal: () => void;
  removeArtist: (artistId: string) => void;
  register: UseFormRegister<EventSubmissionFormData>;
  errors: FieldErrors<EventSubmissionFormData>;
};

const ChooseArtistSection = ({
  mode,
  selectedArtists,
  openArtistSelectionModal,
  removeArtist,
  register,
  errors,
}: ChooseArtistSectionProps) => {
  return (
    <div className={formGroup}>
      <label className={label} htmlFor="artistName">
        <UserIcon />
        應援偶像*
      </label>
      <p className={helperText}>
        {mode === 'edit' ? '編輯模式下無法修改偶像資訊' : '若為聯合應援，可選擇多個偶像'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 已選擇的藝人按鈕 */}
        {selectedArtists.map((artist) => (
          <button
            className={artistSelectionButton}
            key={artist.id}
            type="button"
            onClick={mode === 'edit' ? undefined : openArtistSelectionModal}
            style={{
              opacity: mode === 'edit' ? 0.7 : 1,
              cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
              background: mode === 'edit' ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
            }}
          >
            <div className={selectedArtistInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={imageContainer}>
                  <Image
                    src={artist.profileImage ?? ''}
                    alt={artist.stageName}
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <span className={artistName}>
                    {artist.stageName.toUpperCase()} {artist.realName}
                  </span>
                </div>
              </div>
              {mode === 'create' && (
                <XMarkIcon
                  width={16}
                  height={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeArtist(artist.id);
                  }}
                />
              )}
            </div>
          </button>
        ))}

        {mode === 'create' && selectedArtists.length < 10 && (
          <button
            className={artistSelectionButton}
            type="button"
            onClick={openArtistSelectionModal}
          >
            <span className={placeholderText}>請選擇偶像</span>
            <ChevronDownIcon width={16} height={16} />
          </button>
        )}
      </div>
      <input type="hidden" {...register('artistIds')} />
      {errors.artistIds && <p className={errorText}>{errors.artistIds.message}</p>}
    </div>
  );
};

export default ChooseArtistSection;
