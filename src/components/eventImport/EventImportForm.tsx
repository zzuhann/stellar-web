'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { css } from '@/styled-system/css';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { CreateEventRequest, Artist, ParsedCaptionData } from '@/types';
import showToast from '@/lib/toast';
import ArtistSelectionModal from '@/components/forms/ArtistSelectionModal';
import ChooseArtistSection from '@/components/submitEvent/ChooseArtistSection';
import EventInfoSection from '@/components/submitEvent/EventInfoSection';
import { EVENT_FORM_FIELD_ORDER } from '@/components/submitEvent/fieldOrder';
import { buildReservationPayload } from '@/components/submitEvent/reservationPayload';
import { taipeiDateTimeToTimestamp } from '@/utils';
import { scrollToFirstErrorField } from '@/utils/formHelpers';

import CaptionParseSection from './CaptionParseSection';
import CoverImageUrlField from './CoverImageUrlField';
import DetailImageUrlSection from './DetailImageUrlSection';
import { useParseCaptionMutation } from './hooks/useParseCaptionMutation';
import { useCoverImageUrlFetch } from './hooks/useCoverImageUrlFetch';
import { useImageUrlQueue } from './hooks/useImageUrlQueue';
import { useCreateImportedEventMutation } from './hooks/useCreateImportedEventMutation';
import {
  mergeParsedCaptionIntoForm,
  buildParsedFieldsToastMessage,
} from './utils/mergeParsedCaption';
import { resolveParseCaptionError, shouldApplyParsedCaption } from './utils/parseCaptionMessages';

const MAX_DETAIL_IMAGES = 10;

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

const formLayout = css({
  minWidth: '0',
  border: '0',
  padding: '0',
  margin: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6',
});

export default function EventImportForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
  } = useForm<EventSubmissionFormData>({
    resolver: zodResolver(eventSubmissionSchema),
    // 比照 EventSubmissionForm：改由 handleInvalidSubmit + fieldRefs 統一處理捲動/聚焦
    shouldFocusError: false,
  });

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
  // PlaceAutocomplete / SocialAccountRows 只在 mount 時讀值，解析帶入後要靠這個 key 重新掛載
  const [autoFillVersion, setAutoFillVersion] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [uploadedDetailImages, setUploadedDetailImages] = useState<string[]>([]);

  // ─── 貼上貼文文案 ───
  const [captionValue, setCaptionValue] = useState('');
  const [captionErrorMessage, setCaptionErrorMessage] = useState<string | null>(null);
  const [detectedArtistName, setDetectedArtistName] = useState<string | null>(null);
  const parseCaptionMutation = useParseCaptionMutation();

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

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

      if (updates.title !== undefined) {
        setValue('title', updates.title, { shouldValidate: true, shouldDirty: true });
      }
      if (updates.description !== undefined) {
        setValue('description', updates.description, { shouldDirty: true });
      }
      if (updates.startDate !== undefined) {
        setValue('startDate', updates.startDate, { shouldValidate: true, shouldDirty: true });
      }
      if (updates.endDate !== undefined) {
        setValue('endDate', updates.endDate, { shouldValidate: true, shouldDirty: true });
      }
      if (updates.instagram !== undefined) {
        setValue('instagram', updates.instagram, { shouldDirty: true });
      }
      if (updates.threads !== undefined) {
        setValue('threads', updates.threads, { shouldDirty: true });
      }
      if (updates.location) {
        setValue('addressName', updates.location.name, { shouldValidate: true, shouldDirty: true });
        setLocationAddress(updates.location.address);
        setLocationCity(updates.location.city);
        setLocationPlaceId(updates.location.placeId);
        setLocationCoordinates(updates.location.coordinates);
      }
      if (updates.location || updates.instagram !== undefined || updates.threads !== undefined) {
        setAutoFillVersion((v) => v + 1);
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
          // Gemini 判定完全解析不出任何內容時（所有欄位皆為 null），description 也要維持
          // 原樣、不套用原文——這種情況會走 resolveParseCaptionError 的 (a) 常駐錯誤文案，
          // 不是「這段文字是有效活動貼文但沒有 description 相關內容」。只有 Gemini 確實抽出
          // 至少一個有效欄位時，才代表這段文字是有效活動貼文，description 才套用原文整段。
          if (shouldApplyParsedCaption(response)) {
            applyParsedCaption(response.parsed, caption);
          }
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
    }
  );

  // ─── 詳細圖片網址 ───
  const detailImageQueue = useImageUrlQueue();

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
  };

  const setFieldRef = (name: string) => (el: HTMLElement | null) => {
    fieldRefs.current[name] = el;
  };

  const handleInvalidSubmit = (formErrors: FieldErrors<EventSubmissionFormData>) => {
    scrollToFirstErrorField(
      EVENT_FORM_FIELD_ORDER,
      (name) => !!formErrors[name as keyof EventSubmissionFormData],
      fieldRefs.current
    );
  };

  // ─── 送出 ───
  const createEventMutation = useCreateImportedEventMutation();
  const isPending = createEventMutation.isPending;

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
        // 比照 EventSubmissionForm 既有作法：固定套用當天 00:00:00 / 23:59:59（Asia/Taipei），
        // 這個頁面不提供活動時段欄位。
        start: taipeiDateTimeToTimestamp(data.startDate, '00:00:00'),
        end: taipeiDateTimeToTimestamp(data.endDate, '23:59:59'),
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
      reservation: buildReservationPayload(data),
    };

    createEventMutation.mutate(eventData);
  };

  useEffect(() => {
    setValue('detailImage', [...uploadedDetailImages, ...detailImageQueue.successUrls]);
  }, [uploadedDetailImages, detailImageQueue.successUrls, setValue]);

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

      <form
        aria-label="活動貼文匯入表單"
        aria-busy={isPending}
        onSubmit={(e) => handleSubmit(onSubmit, handleInvalidSubmit)(e)}
      >
        <fieldset className={formLayout} disabled={isPending}>
          <ChooseArtistSection
            mode="create"
            selectedArtists={selectedArtists}
            openArtistSelectionModal={() => setArtistSelectionModalOpen(true)}
            removeArtist={removeArtist}
            register={register}
            errors={errors}
            setFieldRef={setFieldRef}
          />

          <EventInfoSection
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
            mainImageUrl={mainImageUrl}
            onUploadComplete={(url) => {
              setMainImageUrl(url);
              setValue('mainImage', url, { shouldValidate: true, shouldDirty: true });
            }}
            onMainImageRemove={() => {
              setMainImageUrl('');
              setValue('mainImage', '', { shouldValidate: true });
              coverImageFetch.reset();
            }}
            isPending={isPending}
            handlePlaceSelect={handlePlaceSelect}
            handleChangeImages={setUploadedDetailImages}
            detailImageUrls={uploadedDetailImages}
            maxDetailImages={Math.max(0, MAX_DETAIL_IMAGES - detailImageQueue.successUrls.length)}
            autoFillVersion={autoFillVersion}
            setFieldRef={setFieldRef}
            mainImageExtra={
              <CoverImageUrlField
                status={coverImageFetch.status}
                errorMessage={coverImageFetch.errorMessage}
                onSubmit={coverImageFetch.fetchUrl}
              />
            }
            detailImageExtra={
              <DetailImageUrlSection
                items={detailImageQueue.items}
                onSubmitUrls={detailImageQueue.enqueue}
                onRetry={detailImageQueue.retry}
                onRemove={detailImageQueue.remove}
              />
            }
          />

          <div className={submitRow}>
            <button type="submit" className={submitButton} disabled={isPending}>
              {isPending ? '建立中…' : '建立活動'}
            </button>
          </div>
        </fieldset>
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
