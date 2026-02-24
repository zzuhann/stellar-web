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

const removeButtonStyle = css({
  background: 'none',
  border: 'none',
  padding: '4px',
  borderRadius: 'radius.sm',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'color.text.secondary',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: 'color.text.primary',
    background: 'color.background.secondary',
  },
  '&:focus': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const ChooseArtistSection = ({
  mode,
  selectedArtists,
  openArtistSelectionModal,
  removeArtist,
  register,
  errors,
}: ChooseArtistSectionProps) => {
  return (
    <div className={formGroup} role="group" aria-labelledby="artistIds-label">
      <label id="artistIds-label" className={label}>
        <UserIcon aria-hidden="true" />
        <div>
          應援偶像<span aria-hidden="true">*</span>
        </div>
        <span className="sr-only">（必填）</span>
      </label>
      <p id="artistIds-hint" className={helperText}>
        {mode === 'edit' ? '編輯模式下無法修改偶像資訊' : '若為聯合應援，可選擇多個偶像'}
      </p>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        role="list"
        aria-label="已選擇的偶像列表"
      >
        {/* 已選擇的藝人按鈕 */}
        {selectedArtists.map((artist) => (
          <div key={artist.id} role="listitem">
            <button
              className={artistSelectionButton}
              type="button"
              onClick={mode === 'edit' ? undefined : openArtistSelectionModal}
              aria-label={
                mode === 'edit'
                  ? `已選擇 ${artist.stageName}，編輯模式下無法修改`
                  : `已選擇 ${artist.stageName}，點擊更換偶像`
              }
              aria-disabled={mode === 'edit'}
              style={{
                opacity: mode === 'edit' ? 0.7 : 1,
                cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                background:
                  mode === 'edit' ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
              }}
            >
              <div className={selectedArtistInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={imageContainer}>
                    <Image
                      src={artist.profileImage ?? ''}
                      alt=""
                      width={48}
                      height={48}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <span className={artistName}>
                      {artist.stageName.toUpperCase()} {artist.realName}
                    </span>
                  </div>
                </div>
                {mode === 'create' && (
                  <button
                    type="button"
                    className={removeButtonStyle}
                    aria-label={`移除 ${artist.stageName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArtist(artist.id);
                    }}
                  >
                    <XMarkIcon aria-hidden="true" width={16} height={16} />
                  </button>
                )}
              </div>
            </button>
          </div>
        ))}

        {mode === 'create' && selectedArtists.length < 10 && (
          <button
            className={artistSelectionButton}
            type="button"
            onClick={openArtistSelectionModal}
            aria-describedby={
              errors.artistIds ? 'artistIds-hint artistIds-error' : 'artistIds-hint'
            }
            aria-invalid={!!errors.artistIds}
          >
            <span className={placeholderText}>請選擇偶像</span>
            <ChevronDownIcon width={16} height={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <input type="hidden" {...register('artistIds')} aria-hidden="true" />
      {errors.artistIds && (
        <p id="artistIds-error" className={errorText} role="alert">
          {errors.artistIds.message}
        </p>
      )}
    </div>
  );
};

export default ChooseArtistSection;
