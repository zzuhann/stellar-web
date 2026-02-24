import {
  CalendarIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { errorText, formGroup, helperText, input, label } from './styles';
import ImageUpload from '../images/ImageUpload';
import { css, cva } from '@/styled-system/css';
import DatePicker from '../DatePicker';
import PlaceAutocomplete from '../forms/PlaceAutocomplete';
import MultiImageUpload from '../images/MultiImageUpload';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { EventSubmissionFormData } from '@/lib/validations';
import { useAuthToken } from '@/hooks/useAuthToken';
import { dateToLocalDateString } from '@/utils';

const textarea = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '16px',
  transition: 'all 0.2s ease',
  resize: 'vertical',
  minHeight: '100px',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '16px',
  },
});

const characterCount = cva({
  base: {
    fontSize: '12px',
    textAlign: 'right',
    marginTop: '4px',
  },
  variants: {
    isOverLimit: {
      true: {
        color: '#ef4444',
      },
      false: {
        color: 'color.text.secondary',
      },
    },
  },
});

const gridContainer = css({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
});

const sectionDivider = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '24px',
  marginTop: '24px',
});

const sectionTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  marginBottom: '8px',
});

type EventInfoSectionProps = {
  register: UseFormRegister<EventSubmissionFormData>;
  errors: FieldErrors<EventSubmissionFormData>;
  mainImageUrl: string;
  onUploadComplete: (imageUrl: string) => void;
  isPending: boolean;
  handleChangeStartDate: (date: string) => void;
  handleChangeEndDate: (date: string) => void;
  handlePlaceSelect: (place: {
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
  }) => void;
  handleChangeImages: (images: string[]) => void;
  detailImageUrls: string[];
  watch: UseFormWatch<EventSubmissionFormData>;
  existingEventLocationName: string;
};

const EventInfoSection = ({
  register,
  errors,
  mainImageUrl,
  onUploadComplete,
  isPending,
  handleChangeStartDate,
  handleChangeEndDate,
  handlePlaceSelect,
  handleChangeImages,
  detailImageUrls,
  watch,
  existingEventLocationName,
}: EventInfoSectionProps) => {
  const { token } = useAuthToken();

  return (
    <>
      {/* 活動標題 */}
      <div className={formGroup}>
        <label className={label} htmlFor="title">
          <div>
            主題名稱<span aria-hidden="true">*</span>
            <span className="sr-only">（必填）</span>
          </div>
        </label>
        <input
          className={input}
          id="title"
          type="text"
          {...register('title')}
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className={errorText} role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* 主視覺圖片 */}
      <div className={formGroup} role="group" aria-labelledby="mainImage-label">
        <label id="mainImage-label" className={label}>
          <PhotoIcon aria-hidden="true" />
          <div>
            主視覺圖片<span aria-hidden="true">*</span>
            <span className="sr-only">（必填）</span>
          </div>
        </label>
        <p id="mainImage-hint" className={helperText}>
          主要宣傳圖片(推薦上傳比例 3:4)
        </p>
        <ImageUpload
          currentImageUrl={mainImageUrl}
          onUploadComplete={onUploadComplete}
          compressionParams={{ maxWidth: 1200, maxHeight: 1200, quality: 0.9 }}
          placeholder="點擊上傳主視覺圖片"
          maxSizeMB={5}
          disabled={isPending}
          authToken={token || undefined}
          enableCrop={false}
        />
        <input type="hidden" {...register('mainImage')} aria-hidden="true" />
        {errors.mainImage && (
          <p id="mainImage-error" className={errorText} role="alert">
            {errors.mainImage.message}
          </p>
        )}
      </div>

      {/* 活動時間 */}
      <div className={gridContainer}>
        <div className={formGroup}>
          <label className={label} htmlFor="startDate">
            <CalendarIcon aria-hidden="true" />
            <div>
              開始日期<span aria-hidden="true">*</span>
              <span className="sr-only">（必填）</span>
            </div>
          </label>
          <DatePicker
            value={watch('startDate') || ''}
            onChange={handleChangeStartDate}
            placeholder="選擇開始日期"
            disabled={isPending}
            error={!!errors.startDate}
            min={dateToLocalDateString(new Date())}
          />
          <input type="hidden" {...register('startDate')} aria-hidden="true" />
          {errors.startDate && (
            <p id="startDate-error" className={errorText} role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className={formGroup}>
          <label className={label} htmlFor="endDate">
            <CalendarIcon aria-hidden="true" />
            <div>
              結束日期<span aria-hidden="true">*</span>
              <span className="sr-only">（必填）</span>
            </div>
          </label>
          <DatePicker
            value={watch('endDate') || ''}
            onChange={handleChangeEndDate}
            min={watch('startDate')}
            placeholder="選擇結束日期"
            disabled={isPending || !watch('startDate')}
            error={!!errors.endDate}
          />
          {!watch('startDate') && (
            <p
              className={helperText}
              style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}
              role="alert"
            >
              <ExclamationTriangleIcon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              請先選擇開始日期
            </p>
          )}
          <input type="hidden" {...register('endDate')} aria-hidden="true" />
          {errors.endDate && (
            <p id="endDate-error" className={errorText} role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* 活動地址 */}
      <div className={formGroup} role="group" aria-labelledby="addressName-label">
        <label id="addressName-label" className={label}>
          <MapPinIcon aria-hidden="true" />
          <div>
            地點<span aria-hidden="true">*</span>
            <span className="sr-only">（必填）</span>
          </div>
        </label>
        <p id="addressName-hint" className={helperText}>
          搜尋店家名稱或地址（出現選項之後，選擇正確的店家即可！）
        </p>
        <PlaceAutocomplete
          onPlaceSelect={handlePlaceSelect}
          defaultValue={existingEventLocationName}
        />
        <input type="hidden" {...register('addressName')} aria-hidden="true" />
        {errors.addressName && (
          <p id="addressName-error" className={errorText} role="alert">
            {errors.addressName.message}
          </p>
        )}
      </div>

      {/* 活動描述 */}
      <div className={formGroup}>
        <label className={label} htmlFor="description">
          詳細說明
        </label>
        <textarea
          className={textarea}
          id="description"
          rows={10}
          placeholder="描述應援內容與資訊，例如：時間/領取應援/注意事項等等"
          {...register('description')}
          aria-describedby="description-count"
          aria-invalid={!!errors.description}
        />
        <div
          id="description-count"
          className={characterCount({
            isOverLimit: (watch('description')?.length || 0) > 1500,
          })}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">目前字數：</span>
          {watch('description')?.length || 0} / 1500
          {(watch('description')?.length || 0) > 1500 && (
            <span className="sr-only">，已超過字數限制</span>
          )}
        </div>
        {errors.description && (
          <p id="description-error" className={errorText} role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 詳細說明圖片 */}
      <div className={formGroup} role="group" aria-labelledby="detailImage-label">
        <label id="detailImage-label" className={label}>
          <PhotoIcon aria-hidden="true" />
          詳細說明圖片
        </label>
        <p id="detailImage-hint" className={helperText}>
          除了主視覺圖片以外的詳細說明圖片，可包含活動流程、注意事項等詳細資訊，最多可上傳 10 張
        </p>
        <MultiImageUpload
          currentImages={detailImageUrls}
          onImagesChange={handleChangeImages}
          maxImages={10}
          placeholder="點擊新增圖片"
          maxSizeMB={5}
          disabled={isPending}
          authToken={token || undefined}
          compressionParams={{ maxWidth: 1200, maxHeight: 1200, quality: 0.9 }}
        />
        <input type="hidden" {...register('detailImage')} aria-hidden="true" />
        {errors.detailImage && (
          <p id="detailImage-error" className={errorText} role="alert">
            {errors.detailImage.message}
          </p>
        )}
      </div>

      {/* 聯絡資訊 */}
      <div className={sectionDivider} role="group" aria-labelledby="social-media-title">
        <h3 id="social-media-title" className={sectionTitle}>
          社群媒體
        </h3>
        <p id="social-media-hint" className={helperText}>
          請提供主要公布資訊的社群平台，請至少填寫一項，若無則會審核失敗
        </p>
        <p className={helperText}>
          若為聯合主辦，可以用半形逗號分隔 id，例如: stellar_tw, stellar_jp
        </p>

        <div className={gridContainer} style={{ marginTop: '8px' }}>
          {errors.instagram && errors.instagram.type === 'custom' && (
            <p
              id="social-media-error"
              className={errorText}
              style={{ marginTop: '8px' }}
              role="alert"
            >
              {errors.instagram.message}
            </p>
          )}
          <div className={formGroup}>
            <label className={label} htmlFor="instagram">
              Instagram
            </label>
            <input
              className={input}
              id="instagram"
              type="text"
              placeholder="填寫 id 例如: boynextdoor_official"
              {...register('instagram')}
              aria-describedby="social-media-hint"
            />
          </div>
          <div className={formGroup}>
            <label className={label} htmlFor="x">
              X
            </label>
            <input
              className={input}
              id="x"
              type="text"
              placeholder="填寫 id 例如: BOYNEXTDOOR_KOZ"
              {...register('x')}
              aria-describedby="social-media-hint"
            />
          </div>
          <div className={formGroup}>
            <label className={label} htmlFor="threads">
              Threads
            </label>
            <input
              className={input}
              id="threads"
              type="text"
              placeholder="填寫 id 例如: _muri.ri"
              {...register('threads')}
              aria-describedby="social-media-hint"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EventInfoSection;
