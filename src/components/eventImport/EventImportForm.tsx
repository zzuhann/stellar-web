'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPinIcon, PhotoIcon, UserIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { useAuthToken } from '@/hooks/useAuthToken';
import { CreateEventRequest, Artist, ParsedCaptionData } from '@/types';
import showToast from '@/lib/toast';
import ArtistSelectionModal from '@/components/forms/ArtistSelectionModal';
import ChooseArtistSection from '@/components/submitEvent/ChooseArtistSection';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import DatePicker from '@/components/DatePicker';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import { dateToLocalDateString } from '@/utils';
import { formGroup, label, input, helperText, errorText } from '@/components/submitEvent/styles';

import CaptionParseSection from './CaptionParseSection';
import CoverImageUrlField from './CoverImageUrlField';
import DetailImageUrlSection from './DetailImageUrlSection';
import AutoFillHint from './AutoFillHint';
import { useParseCaptionMutation } from './hooks/useParseCaptionMutation';
import { useCoverImageUrlFetch } from './hooks/useCoverImageUrlFetch';
import { useImageUrlQueue } from './hooks/useImageUrlQueue';
import { useCreateImportedEventMutation } from './hooks/useCreateImportedEventMutation';
import {
  mergeParsedCaptionIntoForm,
  buildParsedFieldsToastMessage,
} from './utils/mergeParsedCaption';
import { resolveParseCaptionError } from './utils/parseCaptionMessages';

const pageContainer = css({
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '6',
});

const pageHeader = css({
  '& h1': { textStyle: 'h2', color: 'color.text.primary', margin: '0 0 8px 0' },
  '& p': { textStyle: 'bodySmall', color: 'color.text.secondary', margin: '0' },
});

const gridContainer = css({ display: 'grid', gridTemplateColumns: '1fr', gap: '4' });

const submitRow = css({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: '6',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const submitButton = css({
  paddingY: '4',
  paddingX: '8',
  minHeight: '44px',
  borderRadius: 'radius.lg',
  border: 'none',
  background: 'color.primary',
  color: 'white',
  textStyle: 'body',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:disabled': { background: 'color.text.disabled', cursor: 'not-allowed' },
});

const formLayout = css({ display: 'flex', flexDirection: 'column', gap: '6' });

type AutoFillKey =
  | 'title'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'location'
  | 'socialMedia'
  | 'mainImage';

export default function EventImportForm() {
  const { token } = useAuthToken();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
  } = useForm<EventSubmissionFormData>({ resolver: zodResolver(eventSubmissionSchema) });

  // DatePicker / PlaceAutocomplete 是 controlled 元件，setValue 不會自動觸發它們重新渲染，
  // 需要 useWatch 訂閱才能在自動帶入時反映最新值（比照 EventSubmissionForm 既有作法）。
  const watchedStartDate = useWatch({ control, name: 'startDate' }) ?? '';
  const watchedEndDate = useWatch({ control, name: 'endDate' }) ?? '';
  const watchedAddressName = useWatch({ control, name: 'addressName' }) ?? '';

  // ─── 不受 react-hook-form 管理的欄位（比照 EventSubmissionForm 的既有模式） ───
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [artistSelectionModalOpen, setArtistSelectionModalOpen] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationPlaceId, setLocationPlaceId] = useState<string | undefined>(undefined);
  const [locationAutoFillVersion, setLocationAutoFillVersion] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [uploadedDetailImages, setUploadedDetailImages] = useState<string[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<AutoFillKey>>(new Set());

  const clearAutoFill = useCallback((key: AutoFillKey) => {
    setAutoFilledFields((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // ─── 貼上貼文文案 ───
  const [captionValue, setCaptionValue] = useState('');
  const [captionErrorMessage, setCaptionErrorMessage] = useState<string | null>(null);
  const [detectedArtistName, setDetectedArtistName] = useState<string | null>(null);
  const parseCaptionMutation = useParseCaptionMutation();

  // 管理員修改文字內容時清除常駐錯誤文字（design-frontend.md〈畫面規格〉第 6 點）；
  // 再次觸發解析的清除邏輯見 handleParseCaption。
  const handleCaptionChange = useCallback((value: string) => {
    setCaptionValue(value);
    setCaptionErrorMessage(null);
  }, []);

  const applyParsedCaption = useCallback(
    (parsed: ParsedCaptionData, rawCaption: string) => {
      const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(
        {
          title: getValues('title') || '',
          description: getValues('description') || '',
          startDate: getValues('startDate') || '',
          endDate: getValues('endDate') || '',
          addressName: getValues('addressName') || '',
          instagram: getValues('instagram') || '',
          threads: getValues('threads') || '',
        },
        parsed,
        rawCaption
      );

      const filledKeys: AutoFillKey[] = [];

      if (updates.title !== undefined) {
        setValue('title', updates.title, { shouldValidate: true, shouldDirty: true });
        filledKeys.push('title');
      }
      if (updates.description !== undefined) {
        setValue('description', updates.description, { shouldDirty: true });
        filledKeys.push('description');
      }
      if (updates.startDate !== undefined) {
        setValue('startDate', updates.startDate, { shouldValidate: true, shouldDirty: true });
        filledKeys.push('startDate');
      }
      if (updates.endDate !== undefined) {
        setValue('endDate', updates.endDate, { shouldValidate: true, shouldDirty: true });
        filledKeys.push('endDate');
      }
      if (updates.instagram !== undefined) {
        setValue('instagram', updates.instagram, { shouldDirty: true });
      }
      if (updates.threads !== undefined) {
        setValue('threads', updates.threads, { shouldDirty: true });
      }
      if (updates.instagram !== undefined || updates.threads !== undefined) {
        filledKeys.push('socialMedia');
      }
      if (updates.location) {
        setValue('addressName', updates.location.name, { shouldValidate: true, shouldDirty: true });
        setLocationAddress(updates.location.address);
        setLocationCity(updates.location.city);
        setLocationPlaceId(updates.location.placeId);
        setLocationCoordinates(updates.location.coordinates);
        setLocationAutoFillVersion((v) => v + 1);
        filledKeys.push('location');
      }

      if (filledKeys.length > 0) {
        setAutoFilledFields((prev) => new Set([...prev, ...filledKeys]));
      }

      showToast.success(buildParsedFieldsToastMessage(filledFieldLabels));
    },
    [getValues, setValue]
  );

  // design-frontend.md〈畫面規格〉第 6 點：常駐錯誤文字要「直到管理員修改文字內容或
  // 再次觸發解析才清除」——這裡涵蓋後者，修改文字內容的清除邏輯見 handleCaptionChange。
  const handleParseCaption = (caption: string) => {
    setCaptionErrorMessage(null);
    parseCaptionMutation.mutate(caption, {
      onSuccess: (response) => {
        setCaptionErrorMessage(resolveParseCaptionError(response, undefined));
        if (response.success) {
          setDetectedArtistName(response.parsed.artistName);
          // description（文案原文整段）不管 Gemini 這次抽出了什麼都會嘗試套用，
          // 不像其他欄位受限於 Gemini 有沒有抽到東西——所以這裡不再用
          // isParsedEmpty 擋（那個判斷只用來決定要不要顯示 (a) 常駐錯誤文案）。
          applyParsedCaption(response.parsed, caption);
        } else {
          setDetectedArtistName(null);
        }
      },
      onError: () => {
        setCaptionErrorMessage(resolveParseCaptionError(undefined, true));
        setDetectedArtistName(null);
      },
    });
  };

  // ─── 封面圖網址 ───
  const coverImageFetch = useCoverImageUrlFetch(
    () => !getValues('mainImage'),
    (url) => {
      setMainImageUrl(url);
      setValue('mainImage', url, { shouldValidate: true, shouldDirty: true });
      setAutoFilledFields((prev) => new Set([...prev, 'mainImage' as AutoFillKey]));
    }
  );

  // ─── 詳細圖片網址 ───
  const detailImageQueue = useImageUrlQueue();

  useEffect(() => {
    const combined = [...uploadedDetailImages, ...detailImageQueue.successUrls];
    setValue('detailImage', combined);
  }, [uploadedDetailImages, detailImageQueue.successUrls, setValue]);

  // ─── 藝人選擇 ───
  const handleArtistSelect = (artist: Artist) => {
    if (selectedArtists.some((a) => a.id === artist.id)) return;
    const next = [...selectedArtists, artist];
    setSelectedArtists(next);
    setValue(
      'artistIds',
      next.map((a) => a.id),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const removeArtist = (artistId: string) => {
    const next = selectedArtists.filter((a) => a.id !== artistId);
    setSelectedArtists(next);
    setValue(
      'artistIds',
      next.map((a) => a.id),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  // ─── 地點（手動選擇時清除自動帶入提示） ───
  const handlePlaceSelect = (place: {
    place_id: string;
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
    city: string;
  }) => {
    setValue('addressName', place.name, { shouldValidate: true, shouldDirty: true });
    setLocationCoordinates(place.coordinates);
    setLocationAddress(place.address);
    setLocationCity(place.city);
    setLocationPlaceId(place.place_id);
    clearAutoFill('location');
  };

  // ─── 送出 ───
  const createEventMutation = useCreateImportedEventMutation();

  const onSubmit = (data: EventSubmissionFormData) => {
    if (selectedArtists.length === 0) {
      showToast.warning('請至少選擇一個藝人');
      return;
    }

    const eventData: CreateEventRequest = {
      title: data.title,
      artistIds: selectedArtists.map((a) => a.id),
      description: data.description || '',
      datetime: {
        // 比照 EventSubmissionForm 既有作法：固定套用當天 00:00:00 / 23:59:59，
        // 這個頁面不提供活動時段欄位。
        start: {
          _seconds: Math.floor(new Date(data.startDate + 'T00:00:00').getTime() / 1000),
          _nanoseconds: 0,
        },
        end: {
          _seconds: Math.floor(new Date(data.endDate + 'T23:59:59').getTime() / 1000),
          _nanoseconds: 0,
        },
      },
      location: {
        name: data.addressName,
        address: locationAddress,
        city: locationCity,
        placeId: locationPlaceId,
        coordinates: locationCoordinates || { lat: 25.033, lng: 121.5654 },
      },
      socialMedia: {
        instagram: data.instagram || undefined,
        threads: data.threads || undefined,
      },
      mainImage: mainImageUrl || undefined,
      detailImage: [...uploadedDetailImages, ...detailImageQueue.successUrls],
    };

    createEventMutation.mutate(eventData);
  };

  return (
    <div className={pageContainer}>
      <div className={pageHeader}>
        <h1>活動貼文匯入</h1>
        <p>貼上貼文文案與圖片網址，自動整理活動草稿；確認後建立 pending 活動，沿用既有審核流程。</p>
      </div>

      <CaptionParseSection
        value={captionValue}
        onChange={handleCaptionChange}
        onParse={handleParseCaption}
        isParsing={parseCaptionMutation.isPending}
        errorMessage={captionErrorMessage}
        detectedArtistName={detectedArtistName}
      />

      <form className={formLayout} aria-label="活動貼文匯入表單" onSubmit={handleSubmit(onSubmit)}>
        <ChooseArtistSection
          mode="create"
          selectedArtists={selectedArtists}
          openArtistSelectionModal={() => setArtistSelectionModalOpen(true)}
          removeArtist={removeArtist}
          register={register}
          errors={errors}
        />

        {/* 標題 */}
        <div className={formGroup}>
          <label className={label} htmlFor="title">
            主題名稱<span aria-hidden="true">*</span>
            <span className="sr-only">（必填）</span>
          </label>
          <input
            className={input}
            id="title"
            type="text"
            {...register('title', { onChange: () => clearAutoFill('title') })}
            aria-invalid={!!errors.title}
          />
          <AutoFillHint show={autoFilledFields.has('title')} />
          {errors.title && (
            <p className={errorText} role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* 封面圖 */}
        <div className={formGroup} role="group" aria-labelledby="mainImage-label">
          <label id="mainImage-label" className={label}>
            <PhotoIcon aria-hidden="true" />
            主視覺圖片<span aria-hidden="true">*</span>
            <span className="sr-only">（必填）</span>
          </label>
          <ImageUpload
            key={mainImageUrl}
            currentImageUrl={mainImageUrl}
            onUploadComplete={(url) => {
              setMainImageUrl(url);
              setValue('mainImage', url, { shouldValidate: true, shouldDirty: true });
              clearAutoFill('mainImage');
            }}
            onImageRemove={() => {
              setMainImageUrl('');
              setValue('mainImage', '', { shouldValidate: true });
              clearAutoFill('mainImage');
              coverImageFetch.reset();
            }}
            compressionParams={{ maxWidth: 1200, maxHeight: 1200, quality: 0.9 }}
            placeholder="點擊上傳主視覺圖片"
            maxSizeMB={5}
            authToken={token || undefined}
            enableCrop={false}
          />
          <CoverImageUrlField
            status={coverImageFetch.status}
            errorMessage={coverImageFetch.errorMessage}
            onSubmit={coverImageFetch.fetchUrl}
          />
          <AutoFillHint show={autoFilledFields.has('mainImage')} label="已從網址帶入，可直接修改" />
          <input type="hidden" {...register('mainImage')} aria-hidden="true" />
          {errors.mainImage && (
            <p className={errorText} role="alert">
              {errors.mainImage.message}
            </p>
          )}
        </div>

        {/* 活動日期 */}
        <div className={gridContainer}>
          <div className={formGroup}>
            <label className={label} htmlFor="startDate">
              <CalendarIcon aria-hidden="true" />
              開始日期<span aria-hidden="true">*</span>
              <span className="sr-only">（必填）</span>
            </label>
            <DatePicker
              value={watchedStartDate}
              onChange={(date) => {
                setValue('startDate', date, { shouldValidate: true, shouldDirty: true });
                clearAutoFill('startDate');
              }}
              placeholder="選擇開始日期"
              error={!!errors.startDate}
              min={dateToLocalDateString(new Date())}
            />
            <input type="hidden" {...register('startDate')} aria-hidden="true" />
            <AutoFillHint show={autoFilledFields.has('startDate')} />
            {errors.startDate && (
              <p className={errorText} role="alert">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className={formGroup}>
            <label className={label} htmlFor="endDate">
              <CalendarIcon aria-hidden="true" />
              結束日期<span aria-hidden="true">*</span>
              <span className="sr-only">（必填）</span>
            </label>
            <DatePicker
              value={watchedEndDate}
              onChange={(date) => {
                setValue('endDate', date, { shouldValidate: true, shouldDirty: true });
                clearAutoFill('endDate');
              }}
              min={watchedStartDate}
              placeholder="選擇結束日期"
              error={!!errors.endDate}
            />
            <input type="hidden" {...register('endDate')} aria-hidden="true" />
            <AutoFillHint show={autoFilledFields.has('endDate')} />
            {errors.endDate && (
              <p className={errorText} role="alert">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* 地點 */}
        <div className={formGroup} role="group" aria-labelledby="addressName-label">
          <label id="addressName-label" className={label}>
            <MapPinIcon aria-hidden="true" />
            地點<span aria-hidden="true">*</span>
            <span className="sr-only">（必填）</span>
          </label>
          <PlaceAutocomplete
            key={locationAutoFillVersion}
            onPlaceSelect={handlePlaceSelect}
            defaultValue={watchedAddressName}
          />
          <input type="hidden" {...register('addressName')} aria-hidden="true" />
          <AutoFillHint show={autoFilledFields.has('location')} />
          {errors.addressName && (
            <p className={errorText} role="alert">
              {errors.addressName.message}
            </p>
          )}
        </div>

        {/* 詳細說明 */}
        <div className={formGroup}>
          <label className={label} htmlFor="description">
            詳細說明
          </label>
          <p className={helperText}>
            可填入應援禮說明、預約/號碼牌規則、場地注意事項等；若已貼上文案，會自動帶入文案原文整段，可直接修改
          </p>
          <textarea
            className={input}
            id="description"
            rows={6}
            {...register('description', { onChange: () => clearAutoFill('description') })}
          />
          <AutoFillHint show={autoFilledFields.has('description')} />
          {errors.description && (
            <p className={errorText} role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* 詳細圖片 */}
        <DetailImageUrlSection
          items={detailImageQueue.items}
          onSubmitUrls={detailImageQueue.enqueue}
          onRetry={detailImageQueue.retry}
          onRemove={detailImageQueue.remove}
        />
        <MultiImageUpload
          currentImages={uploadedDetailImages}
          onImagesChange={setUploadedDetailImages}
          maxImages={Math.max(
            0,
            10 - uploadedDetailImages.length - detailImageQueue.successUrls.length
          )}
          placeholder="或點擊上傳圖片檔案"
          maxSizeMB={5}
          authToken={token || undefined}
          compressionParams={{ maxWidth: 1200, maxHeight: 1200, quality: 0.9 }}
        />
        <input type="hidden" {...register('detailImage')} aria-hidden="true" />
        {errors.detailImage && (
          <p className={errorText} role="alert">
            {errors.detailImage.message}
          </p>
        )}

        {/* 社群媒體 */}
        <div className={gridContainer}>
          <div className={formGroup}>
            <label className={label} htmlFor="instagram">
              <UserIcon aria-hidden="true" />
              Instagram
            </label>
            <input
              className={input}
              id="instagram"
              type="text"
              placeholder="填寫 id 例如: boynextdoor_official"
              {...register('instagram', { onChange: () => clearAutoFill('socialMedia') })}
            />
            <AutoFillHint show={autoFilledFields.has('socialMedia')} />
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
              {...register('threads', { onChange: () => clearAutoFill('socialMedia') })}
            />
          </div>
          {errors.instagram && (
            <p className={errorText} role="alert">
              {errors.instagram.message}
            </p>
          )}
        </div>

        <div className={submitRow}>
          <button type="submit" className={submitButton} disabled={createEventMutation.isPending}>
            {createEventMutation.isPending ? '建立中…' : '建立活動'}
          </button>
        </div>
      </form>

      <ArtistSelectionModal
        isOpen={artistSelectionModalOpen}
        onClose={() => setArtistSelectionModalOpen(false)}
        onArtistSelect={handleArtistSelect}
        selectedArtistIds={selectedArtists.map((a) => a.id)}
      />
    </div>
  );
}
