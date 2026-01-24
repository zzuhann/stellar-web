import { CalendarIcon, MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
          主題名稱*
        </label>
        <input className={input} id="title" type="text" {...register('title')} />
        {errors.title && <p className={errorText}>{errors.title.message}</p>}
      </div>

      {/* 主視覺圖片 */}
      <div className={formGroup}>
        <label className={label}>
          <PhotoIcon />
          主視覺圖片*
        </label>
        <p className={helperText}>主要宣傳圖片(推薦上傳比例 3:4)</p>
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
        <input type="hidden" {...register('mainImage')} />
        {errors.mainImage && <p className={errorText}>{errors.mainImage.message}</p>}
      </div>

      {/* 活動時間 */}
      <div className={gridContainer}>
        <div className={formGroup}>
          <label className={label} htmlFor="startDate">
            <CalendarIcon />
            開始日期*
          </label>
          <DatePicker
            value={watch('startDate') || ''}
            onChange={handleChangeStartDate}
            placeholder="選擇開始日期"
            disabled={isPending}
            error={!!errors.startDate}
            min={dateToLocalDateString(new Date())}
          />
          <input type="hidden" {...register('startDate')} />
          {errors.startDate && <p className={errorText}>{errors.startDate.message}</p>}
        </div>

        <div className={formGroup}>
          <label className={label} htmlFor="endDate">
            <CalendarIcon />
            結束日期*
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
            <p className={helperText} style={{ color: '#f59e0b' }}>
              請先選擇開始日期
            </p>
          )}
          <input type="hidden" {...register('endDate')} />
          {errors.endDate && <p className={errorText}>{errors.endDate.message}</p>}
        </div>
      </div>

      {/* 活動地址 */}
      <div className={formGroup}>
        <label className={label}>
          <MapPinIcon />
          地點*
        </label>
        <p className={helperText}>搜尋店家名稱或地址（出現選項之後，選擇正確的店家即可！）</p>
        <PlaceAutocomplete
          onPlaceSelect={handlePlaceSelect}
          defaultValue={existingEventLocationName}
        />
        <input type="hidden" {...register('addressName')} />
        {errors.addressName && <p className={errorText}>{errors.addressName.message}</p>}
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
        />
        <div
          className={characterCount({
            isOverLimit: (watch('description')?.length || 0) > 1500,
          })}
        >
          {watch('description')?.length || 0} / 1500
        </div>
        {errors.description && <p className={errorText}>{errors.description.message}</p>}
      </div>

      {/* 詳細說明圖片 */}
      <div className={formGroup}>
        <label className={label}>
          <PhotoIcon />
          詳細說明圖片
        </label>
        <p className={helperText}>
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
        <input type="hidden" {...register('detailImage')} />
        {errors.detailImage && <p className={errorText}>{errors.detailImage.message}</p>}
      </div>

      {/* 聯絡資訊 */}
      <div className={sectionDivider}>
        <h3 className={sectionTitle}>社群媒體</h3>
        <p className={helperText}>請提供主要公布資訊的社群平台，請至少填寫一項，若無則會審核失敗</p>
        <p className={helperText}>
          若為聯合主辦，可以用半形逗號分隔 id，例如: stellar_tw, stellar_jp
        </p>

        <div className={gridContainer} style={{ marginTop: '8px' }}>
          {errors.instagram && errors.instagram.type === 'custom' && (
            <p className={errorText} style={{ marginTop: '8px' }}>
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
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EventInfoSection;
