'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { css } from '@/styled-system/css';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { useAuth } from '@/lib/auth-context';
import ArtistSelectionModal from '../forms/ArtistSelectionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { CreateEventRequest, UpdateEventRequest, Artist, CoffeeEvent } from '@/types';
import showToast from '@/lib/toast';
import { firebaseTimestampToDate, dateToLocalDateString } from '@/utils';
import StepIndicator from './StepIndicator';
import ChooseArtistSection from './ChooseArtistSection';
import EventInfoSection from './EventInfoSection';
import useCreateEventMutation from './hooks/useCreateEventMutation';
import useUpdateEventMutation from './hooks/useUpdateEventMutation';
import useResubmitEventMutation from './hooks/useResubmitEventMutation';
import ActionButtons from './ActionButtons';

const formContainer = css({
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.md',
  padding: '32px',
  '@media (min-width: 768px)': {
    padding: '40px',
  },
});

const formHeader = css({
  textAlign: 'center',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  '& h2': {
    fontSize: '24px',
    fontWeight: '700',
    color: 'color.text.primary',
    margin: '0 0 8px 0',
    '@media (min-width: 768px)': {
      fontSize: '28px',
    },
  },
  '& p': {
    fontSize: '14px',
    color: 'color.text.secondary',
    margin: 'unset',
    '@media (min-width: 768px)': {
      fontSize: '16px',
    },
  },
});

const form = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const warningText = css({
  fontSize: '14px',
  color: '#ef4444 !important',
  margin: 'unset',
  marginTop: '8px !important',
  '@media (min-width: 768px)': {
    fontSize: '16px',
  },
});

interface EventSubmissionFormProps {
  mode?: 'create' | 'edit' | 'copy';
  existingEvent?: CoffeeEvent;
  onSuccess?: (event: CoffeeEvent) => void;
  onCancel?: () => void;
}

function EventSubmissionForm({
  mode = 'create',
  existingEvent,
  onSuccess,
  onCancel,
}: EventSubmissionFormProps) {
  // 步驟：edit/copy mode直接跳到第二步，create mode 從第一步開始
  const [currentStep, setCurrentStep] = useState(mode === 'edit' || mode === 'copy' ? 2 : 1);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(existingEvent?.location.coordinates || null);
  const [locationAddress, setLocationAddress] = useState(existingEvent?.location.address || '');
  const [artistSelectionModalOpen, setArtistSelectionModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<EventSubmissionFormData | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(() => {
    if (existingEvent?.artists) {
      // 將 CoffeeEvent.artists 轉換為 Artist 格式（用於顯示）
      return existingEvent.artists.map((artist) => ({
        id: artist.id,
        stageName: artist.name,
        realName: undefined,
        profileImage: artist.profileImage,
        status: 'approved' as const,
        createdBy: '',
        createdAt: {
          _seconds: 0,
          _nanoseconds: 0,
        },
        updatedAt: {
          _seconds: 0,
          _nanoseconds: 0,
        },
      }));
    }
    return [];
  });
  const [mainImageUrl, setMainImageUrl] = useState<string>(existingEvent?.mainImage || '');
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>(() => {
    if (existingEvent?.detailImage) {
      return Array.isArray(existingEvent.detailImage)
        ? existingEvent.detailImage
        : [existingEvent.detailImage];
    }
    return [];
  });
  const { user } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<EventSubmissionFormData>({
    resolver: zodResolver(eventSubmissionSchema),
    defaultValues: existingEvent
      ? {
          title: existingEvent.title,
          description: existingEvent.description,
          addressName: existingEvent.location.name,
          startDate: dateToLocalDateString(firebaseTimestampToDate(existingEvent.datetime.start)),
          endDate: dateToLocalDateString(firebaseTimestampToDate(existingEvent.datetime.end)),
          instagram: existingEvent.socialMedia.instagram || '',
          x: existingEvent.socialMedia.x || '',
          threads: existingEvent.socialMedia.threads || '',
          mainImage: existingEvent.mainImage || '',
          detailImage: Array.isArray(existingEvent.detailImage)
            ? existingEvent.detailImage
            : existingEvent.detailImage
              ? [existingEvent.detailImage]
              : [],
          artistIds: existingEvent.artists.map((artist) => artist.id),
        }
      : undefined,
  });

  const createEventMutation = useCreateEventMutation({ onSuccess });
  const updateEventMutation = useUpdateEventMutation({ onSuccess });
  const resubmitEventMutation = useResubmitEventMutation();

  const handlePlaceSelect = (place: {
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
  }) => {
    setValue('addressName', place.name, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setLocationCoordinates(place.coordinates);
    setLocationAddress(place.address);
  };

  const handleArtistSelect = (artist: Artist) => {
    // 檢查是否已經選擇過這個藝人
    const isAlreadySelected = selectedArtists.some((selected) => selected.id === artist.id);
    if (!isAlreadySelected) {
      const newSelectedArtists = [...selectedArtists, artist];
      setSelectedArtists(newSelectedArtists);
      // 更新表單值，使用藝人ID陣列
      const artistIds = newSelectedArtists.map((a) => a.id);
      setValue('artistIds', artistIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const removeArtist = (artistId: string) => {
    const newSelectedArtists = selectedArtists.filter((artist) => artist.id !== artistId);
    setSelectedArtists(newSelectedArtists);

    if (newSelectedArtists.length > 0) {
      const artistIds = newSelectedArtists.map((a) => a.id);
      setValue('artistIds', artistIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue('artistIds', [], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const openArtistSelectionModal = () => {
    setArtistSelectionModalOpen(true);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // 檢查是否已選擇藝人
      if (selectedArtists.length === 0) {
        showToast.warning('請至少選擇一個偶像');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleChangeStartDate = (date: string) => {
    setValue('startDate', date, { shouldValidate: true, shouldDirty: true });
    // 如果結束日期早於新的開始日期，自動設為開始日期
    const endDate = watch('endDate');
    if (endDate && new Date(endDate) < new Date(date)) {
      setValue('endDate', date, { shouldValidate: true, shouldDirty: true });
    }

    // 如果還沒有結束日期，自動設為開始日期
    if (!endDate) {
      setValue('endDate', date, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleChangeEndDate = (date: string) => {
    setValue('endDate', date, { shouldValidate: true, shouldDirty: true });
  };

  const handleChangeImages = (imageUrls: string[]) => {
    setDetailImageUrls(imageUrls);
    setValue('detailImage', imageUrls, {
      shouldValidate: false,
      shouldDirty: false,
    });
  };

  // 是否有任何 changes
  const checkForChanges = () => {
    if (mode !== 'edit' || !existingEvent) {
      return true; // 非編輯模式（create/copy）一律允許送出
    }

    // 檢查表單欄位改變
    const formHasChanges = isDirty;

    // 檢查主圖改變
    const mainImageChanged = mainImageUrl !== (existingEvent.mainImage || '');

    // 檢查詳細圖片改變
    const originalDetailImages = existingEvent.detailImage
      ? Array.isArray(existingEvent.detailImage)
        ? existingEvent.detailImage
        : [existingEvent.detailImage]
      : [];
    const detailImagesChanged =
      detailImageUrls.length !== originalDetailImages.length ||
      detailImageUrls.some((url, index) => url !== originalDetailImages[index]);

    // 檢查偶像選擇改變
    const originalArtistIds = existingEvent.artists?.map((artist) => artist.id) || [];
    const selectedArtistIds = selectedArtists.map((artist) => artist.id);
    const artistsChanged =
      originalArtistIds.length !== selectedArtistIds.length ||
      originalArtistIds.some((id) => !selectedArtistIds.includes(id));

    // 檢查地點改變
    const locationChanged =
      locationAddress !== (existingEvent.location.address || '') ||
      locationCoordinates?.lat !== existingEvent.location.coordinates?.lat ||
      locationCoordinates?.lng !== existingEvent.location.coordinates?.lng;

    return (
      formHasChanges || mainImageChanged || detailImagesChanged || artistsChanged || locationChanged
    );
  };

  const onSubmit = async (data: EventSubmissionFormData) => {
    if (!user) {
      showToast.warning('請先登入');
      return;
    }

    // 檢查是否有變更
    if (!checkForChanges()) {
      showToast.success('更新成功');
      return;
    }

    // 如果是編輯模式且狀態是 rejected，顯示確認彈窗
    if (mode === 'edit' && existingEvent?.status === 'rejected') {
      setPendingSubmitData(data);
      setConfirmModalOpen(true);
      return;
    }

    await submitEventData(data);
  };

  // 同步 selectedArtists 和 detailImageUrls 到表單
  useEffect(() => {
    setValue(
      'artistIds',
      selectedArtists.map((artist) => artist.id)
    );
  }, [selectedArtists, setValue]);

  useEffect(() => {
    setValue('detailImage', detailImageUrls);
  }, [detailImageUrls, setValue]);

  // 初始化時同步值
  useEffect(() => {
    setValue(
      'artistIds',
      selectedArtists.map((artist) => artist.id)
    );
    setValue('detailImage', detailImageUrls);
    if (mainImageUrl) {
      setValue('mainImage', mainImageUrl);
    }
  }, [detailImageUrls, mainImageUrl, selectedArtists, setValue]);

  const submitEventData = async (data: EventSubmissionFormData) => {
    if (mode === 'create' || mode === 'copy') {
      const eventData: CreateEventRequest = {
        title: data.title,
        artistIds: selectedArtists.map((artist) => artist.id),
        description: data.description || '',
        datetime: {
          start: {
            // 00:00:00
            _seconds: Math.floor(new Date(data.startDate + 'T00:00:00').getTime() / 1000),
            _nanoseconds: 0,
          },
          end: {
            // 23:59:59
            _seconds: Math.floor(new Date(data.endDate + 'T23:59:59').getTime() / 1000),
            _nanoseconds: 0,
          },
        },
        location: {
          name: data.addressName,
          address: locationAddress,
          coordinates: locationCoordinates || {
            // 如果沒有座標，使用台北市中心座標
            lat: 25.033,
            lng: 121.5654,
          },
        },
        socialMedia: {
          instagram: data.instagram || undefined,
          x: data.x || undefined,
          threads: data.threads || undefined,
        },
        mainImage: mainImageUrl || undefined,
        detailImage: detailImageUrls,
      };

      createEventMutation.mutate(eventData, {
        onSuccess: () => {
          router.push(`/my-submissions?tab=event`);
        },
      });
    } else if (mode === 'edit' && existingEvent) {
      const updateData: UpdateEventRequest = {
        title: data.title,
        description: data.description || '',
        datetime: {
          start: {
            // 00:00:00
            _seconds: Math.floor(new Date(data.startDate + 'T00:00:00').getTime() / 1000),
            _nanoseconds: 0,
          },
          end: {
            // 23:59:59
            _seconds: Math.floor(new Date(data.endDate + 'T23:59:59').getTime() / 1000),
            _nanoseconds: 0,
          },
        },
        location: {
          name: data.addressName,
          address: locationAddress,
          coordinates: locationCoordinates || existingEvent.location.coordinates,
        },
        socialMedia: {
          instagram: data.instagram || undefined,
          x: data.x || undefined,
          threads: data.threads || undefined,
        },
        mainImage: mainImageUrl || undefined,
        detailImage: detailImageUrls,
      };

      updateEventMutation.mutate(
        { id: existingEvent.id, data: updateData },
        {
          onSuccess: () => {
            // 如果原本狀態是 rejected，call 重新審核 API
            if (existingEvent.status === 'rejected') {
              resubmitEventMutation.mutate(existingEvent.id);
            } else {
              router.push(`/my-submissions?tab=event`);
            }
          },
        }
      );
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingSubmitData) {
      submitEventData(pendingSubmitData);
      setConfirmModalOpen(false);
      setPendingSubmitData(null);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalOpen(false);
    setPendingSubmitData(null);
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h2>{mode === 'edit' ? '編輯' : mode === 'copy' ? '複製投稿' : '投稿'}</h2>
        {mode !== 'edit' && <p>審核通過之後其他使用者可以在地圖/列表上看到此生日應援!</p>}
        <p className={warningText} role="alert">
          注意：文案、圖片內容若使用中文呈現，<b>需 100% 為正體字</b>。若非正體字，審核將不會通過。
        </p>
      </div>

      {mode === 'create' && currentStep === 1 && <StepIndicator currentStep={currentStep} />}

      <form className={form} aria-label="生日應援投稿表單">
        {/* 第一步：選擇藝人 */}
        {(currentStep === 1 || mode === 'edit' || mode === 'copy') && (
          <ChooseArtistSection
            mode={mode === 'copy' ? 'edit' : mode}
            selectedArtists={selectedArtists}
            openArtistSelectionModal={openArtistSelectionModal}
            removeArtist={removeArtist}
            register={register}
            errors={errors}
          />
        )}

        {/* 第二步：其他活動資訊 */}
        {(currentStep === 2 || mode === 'edit' || mode === 'copy') && (
          <EventInfoSection
            register={register}
            errors={errors}
            mainImageUrl={mainImageUrl}
            onUploadComplete={(imageUrl) => {
              setMainImageUrl(imageUrl);
              setValue('mainImage', imageUrl, {
                shouldValidate: true,
                shouldDirty: true,
              });
              showToast.success('主視覺圖片上傳成功');
            }}
            isPending={createEventMutation.isPending || updateEventMutation.isPending}
            handleChangeStartDate={handleChangeStartDate}
            handleChangeEndDate={handleChangeEndDate}
            handlePlaceSelect={handlePlaceSelect}
            handleChangeImages={handleChangeImages}
            detailImageUrls={detailImageUrls}
            watch={watch}
            existingEventLocationName={existingEvent?.location.name || ''}
          />
        )}

        <ActionButtons
          mode={mode}
          currentStep={currentStep}
          handleNextStep={handleNextStep}
          handlePrevStep={handlePrevStep}
          onCancel={onCancel}
          createEventPending={createEventMutation.isPending}
          updateEventPending={updateEventMutation.isPending}
          resubmitEventPending={resubmitEventMutation.isPending}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          existingEventStatus={existingEvent?.status || 'pending'}
        />
      </form>

      {/* 藝人選擇 Modal - 只在 create mode 顯示 */}
      {mode === 'create' && currentStep === 1 && (
        <ArtistSelectionModal
          isOpen={artistSelectionModalOpen}
          onClose={() => setArtistSelectionModalOpen(false)}
          onArtistSelect={handleArtistSelect}
          selectedArtistIds={selectedArtists.map((artist) => artist.id)}
        />
      )}

      {/* 確認彈窗 - 只在 edit mode 且狀態為 rejected 時顯示 */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="確認重新送審"
        message="是否確認所有資訊都正確？送出之後將會重新送審。"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirm}
        confirmText="確認送出"
        cancelText="取消"
        isLoading={updateEventMutation.isPending || resubmitEventMutation.isPending}
      />
    </div>
  );
}

export default EventSubmissionForm;
