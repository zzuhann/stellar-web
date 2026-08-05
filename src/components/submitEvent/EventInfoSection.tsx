import {
  CalendarIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  MapPinIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { errorText, formGroup, helperText, helperTextWarning, input, label } from './styles';
import ImageUpload from '../images/ImageUpload';
import { css, cva } from '@/styled-system/css';
import DatePicker from '../DatePicker';
import TimePicker from '../TimePicker';
import PlaceAutocomplete from '../forms/PlaceAutocomplete';
import MultiImageUpload from '../images/MultiImageUpload';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { EventSubmissionFormData } from '@/lib/validations';
import { useAuthToken } from '@/hooks/useAuthToken';
import { dateToLocalDateString } from '@/utils';

const textarea = css({
  width: '100%',
  paddingY: '3',
  paddingX: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  resize: 'vertical',
  minHeight: '100px',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
});

const characterCount = cva({
  base: {
    textStyle: 'caption',
    textAlign: 'right',
    marginTop: '1',
  },
  variants: {
    isOverLimit: {
      true: {
        color: 'red.600',
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
  gap: '4',
});

const sectionDivider = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '6',
  marginTop: '6',
});

const sectionTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginBottom: '2',
});

const reservationTimeRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3',
});

const reservationTimeField = css({
  flex: '1',
  minWidth: '140px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const captionLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const reservationLabelRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2',
});

const clearReservationButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  minHeight: '44px',
  paddingX: '3',
  border: 'none',
  background: 'transparent',
  color: 'color.text.secondary',
  textStyle: 'caption',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  transition: 'color 0.2s ease, background 0.2s ease',
  '&:hover': {
    color: 'red.600',
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
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
    place_id: string;
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
    city: string;
  }) => void;
  handleChangeImages: (images: string[]) => void;
  detailImageUrls: string[];
  startDate: string;
  endDate: string;
  description: string;
  existingEventLocationName: string;
  reservationDate: string;
  reservationTime: string;
  handleChangeReservationDate: (date: string) => void;
  handleChangeReservationTime: (time: string) => void;
  setFieldRef: (name: string) => (el: HTMLElement | null) => void;
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
  startDate,
  endDate,
  description,
  existingEventLocationName,
  reservationDate,
  reservationTime,
  handleChangeReservationDate,
  handleChangeReservationTime,
  setFieldRef,
}: EventInfoSectionProps) => {
  const { token } = useAuthToken();

  return (
    <>
      {/* 活動標題 */}
      <div className={formGroup} ref={setFieldRef('title')}>
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
      <div
        className={formGroup}
        role="group"
        aria-labelledby="mainImage-label"
        ref={setFieldRef('mainImage')}
      >
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
        <div className={formGroup} ref={setFieldRef('startDate')}>
          <label className={label} htmlFor="startDate">
            <CalendarIcon aria-hidden="true" />
            <div>
              開始日期<span aria-hidden="true">*</span>
              <span className="sr-only">（必填）</span>
            </div>
          </label>
          <DatePicker
            value={startDate}
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

        <div className={formGroup} ref={setFieldRef('endDate')}>
          <label className={label} htmlFor="endDate">
            <CalendarIcon aria-hidden="true" />
            <div>
              結束日期<span aria-hidden="true">*</span>
              <span className="sr-only">（必填）</span>
            </div>
          </label>
          <DatePicker
            value={endDate}
            onChange={handleChangeEndDate}
            min={startDate}
            placeholder="選擇結束日期"
            disabled={isPending || !startDate}
            error={!!errors.endDate}
          />
          {!startDate && (
            <p className={helperTextWarning} role="alert">
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
      <div
        className={formGroup}
        role="group"
        aria-labelledby="addressName-label"
        ref={setFieldRef('addressName')}
      >
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

      {/* 預約資訊 */}
      <div className={sectionDivider} role="group" aria-labelledby="reservation-title">
        <h3 id="reservation-title" className={sectionTitle}>
          預約資訊（選填）
        </h3>
        <p id="reservation-hint" className={helperText}>
          若此活動需要預約或報名，可提供預約網址與開始預約日期、時間，不需預約則可略過。
        </p>

        <div
          className={formGroup}
          style={{ marginTop: '12px' }}
          ref={setFieldRef('reservationUrl')}
        >
          <label className={label} htmlFor="reservationUrl">
            <LinkIcon aria-hidden="true" />
            預約網址
          </label>
          <input
            className={input}
            id="reservationUrl"
            type="url"
            inputMode="url"
            placeholder="https://forms.gle/xxxx 或預約頁面網址"
            {...register('reservationUrl')}
            aria-invalid={!!errors.reservationUrl}
            aria-describedby={errors.reservationUrl ? 'reservationUrl-error' : undefined}
          />
          {errors.reservationUrl && (
            <p id="reservationUrl-error" className={errorText} role="alert">
              {errors.reservationUrl.message}
            </p>
          )}
        </div>

        <div
          className={formGroup}
          style={{ marginTop: '12px' }}
          role="group"
          aria-labelledby="reservationStartAt-label"
          ref={setFieldRef('reservationTime')}
        >
          <div className={reservationLabelRow}>
            <label id="reservationStartAt-label" className={label}>
              <CalendarIcon aria-hidden="true" />
              預約開始時間
            </label>
            {(reservationDate || reservationTime) && (
              <button
                type="button"
                className={clearReservationButton}
                aria-label="清空預約開始時間"
                onClick={() => {
                  handleChangeReservationDate('');
                  handleChangeReservationTime('');
                }}
              >
                <XMarkIcon width={14} height={14} aria-hidden="true" />
                清空
              </button>
            )}
          </div>
          <div className={reservationTimeRow}>
            <div className={reservationTimeField}>
              <span className={captionLabel} id="reservationDate-label">
                日期
              </span>
              <DatePicker
                value={reservationDate}
                onChange={handleChangeReservationDate}
                placeholder="選擇日期"
                disabled={isPending}
                error={!!errors.reservationTime}
              />
              <input type="hidden" {...register('reservationDate')} aria-hidden="true" />
            </div>
            <div className={reservationTimeField}>
              <span className={captionLabel} id="reservationTime-label">
                時間
              </span>
              <TimePicker
                value={reservationTime}
                onChange={handleChangeReservationTime}
                placeholder="選擇時間"
                disabled={isPending}
                error={!!errors.reservationTime}
              />
              <input type="hidden" {...register('reservationTime')} aria-hidden="true" />
            </div>
          </div>
          {errors.reservationTime && (
            <p id="reservationStartAt-error" className={errorText} role="alert">
              {errors.reservationTime.message}
            </p>
          )}
        </div>
      </div>

      {/* 活動描述 */}
      <div className={`${sectionDivider} ${formGroup}`} ref={setFieldRef('description')}>
        <label className={label} htmlFor="description">
          詳細說明
        </label>
        <p className={helperText}>
          可填入應援禮說明、預約/號碼牌規則、場地注意事項等。活動資訊若有變動，請記得同步更新。
        </p>
        <textarea
          className={textarea}
          id="description"
          rows={10}
          autoComplete="off"
          placeholder="描述應援內容與資訊，例如：時間/領取應援/注意事項等等"
          {...register('description')}
          aria-describedby="description-count"
          aria-invalid={!!errors.description}
        />
        <div
          id="description-count"
          className={characterCount({
            isOverLimit: description.length > 1500,
          })}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">目前字數：</span>
          {description.length} / 1500
          {description.length > 1500 && <span className="sr-only">，已超過字數限制</span>}
        </div>
        {errors.description && (
          <p id="description-error" className={errorText} role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 詳細說明圖片 */}
      <div
        className={formGroup}
        role="group"
        aria-labelledby="detailImage-label"
        ref={setFieldRef('detailImage')}
      >
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
      <div
        className={sectionDivider}
        role="group"
        aria-labelledby="social-media-title"
        ref={setFieldRef('instagram')}
      >
        <h3 id="social-media-title" className={sectionTitle}>
          社群媒體（請填寫 ID 即可，而非完整網址）
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
            <label className={label} htmlFor="threads">
              Threads
            </label>
            <input
              className={input}
              id="threads"
              type="text"
              placeholder="填寫 id 例如: _stellar.tw"
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
